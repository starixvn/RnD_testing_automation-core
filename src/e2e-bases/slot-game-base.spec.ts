import { GameEvent } from "../_shared";
import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { CSLocatorNames } from "../components/base-classic-slot-locator";

const shortWait = 300,
    mediWait = 1000,
    longWait = 5000;

export interface SlotGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class SlotGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: SlotGameOptions) {}

    protected inGameTests() {
        test("Verify received websocket Odds of game shoule be the same with game's config file", async () => {
            // Assert
            await test.step(`Verify ODD should be correct`, async () => {
                expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
            });
        });
    }

    protected mainUITests() {
        test("Verify game name", async () => {
            await this.game.imageExist(CSLocatorNames.imgGameName);
        });

        test("Verify symbols board in first load game", async () => {
            let boardID = await getBoardID();
            await this.game.imageExist(`img${boardID}`);
        });

        test("Verify roundID is null in first load game", async () => {
            await this.game.imageExist(CSLocatorNames.lblRoundID);
        });

        test("Verify payline number in right & left column", async () => {
            await test.step("The numbers are shows in the following order: 20, 8, 2, 14, 17, 7, 1, 10, 23, 15, 9, 3, 21", async () => {
                await this.game.imageExist(CSLocatorNames.imgLeftNumbersColumn);
            });
            await test.step("The numbers are shows in the following order: 18, 5, 12, 24, 6, 22, 16, 11, 19, 13, 4, 25", async () => {
                await this.game.imageExist(CSLocatorNames.imgRightNumbersColumn);
            });
        });
    }

    protected paylineTests() {
        test("Verify default paylines (25 lines) in first load game", async () => {
            await this.game.imageExist(CSLocatorNames.btnPayline);
        });

        test("Verify Payline Popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await openPayLineBoard(this.game);
            for (const placeBetChoice of this.options.placeBetChoices) {
                //Act 1
                await selectBetChoice(this.game, `btn${placeBetChoice}`);

                let betChoice = await this.game.captureLocator(`tbl${placeBetChoice}`);
                // Assert
                expect(betChoice.image).toMatchSnapshot(betChoice.name);

                //Act 2
                await closePayLineBoard(this.game);
                await openPayLineBoard(this.game);
                // Assert2
                expect(betChoice.image).toMatchSnapshot(betChoice.name);
            }
        });

        test("Verify submit bet button is disabled when no choice is selected", async () => {
            // Act submit button is disabled
            await this.game.clickLocator(CSLocatorNames.btnClearPayline);
            await this.game.waitForTimeout(2000);
            await this.game.imageExist(CSLocatorNames.imgConfirmPaylineDisabled);

            //Post-Condition
            await closePayLineBoard(this.game);
        });
    }

    protected betTotalBetTests() {
        test("Verify list bet stake", async () => {
            await this.game.imageExist(CSLocatorNames.cboBetLevel);
            await this.game.clickOutSide();
        });

        test("Verify selected bet stake value and total bet amount", async () => {
            const betStake = ["BetLevel0_1", "BetLevel1", "BetLevel5"];
            const totalStake = ["Totalbet0_1", "Totalbet1", "Totalbet5"];
            for (let index = 0; index < betStake.length; index++) {
                await selectBetStake(this.game, `lbl${betStake[index]}`);

                await this.game.imageExist(`img${betStake[index]}`);
                await this.game.imageExist(`img${totalStake[index]}`);
            }
        });
    }

    protected autoSpinTests() {
        test("Verify default UI of AutoSpin popup", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            // Act
            await openAutoSpinBoard(this.game);
            await this.game.imageExist(CSLocatorNames.popAutoSpin);

            await this.game.clickOutSide();
        });

        test("Verify case user select 10 auto spins then wait for finishing 10 auto spins", async () => {
            let settledResultsAutoSpin = [];
            const totalAutoSpin = 10;

            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: CSLocatorNames.lblBetLevel1 };
            await clickTurbo(this.game);
            await selectPayline(this.game, CSLocatorNames.btnPayline1);
            await selectBetStake(this.game, bet.amount);

            // Act
            await selectAutoSpin(this.game, totalAutoSpin);
            for (let index = 1; index <= totalAutoSpin; index++) {
                const settledResults = await this.game.waitForSettlement();
                settledResultsAutoSpin.push(settledResults.winAmount);
            }

            //Assert
            expect(settledResultsAutoSpin.length >= 10).toBe(true);
            await this.game.waitForTimeout(longWait); //handle cases free spin or bonus

            //Post-Act
            await this.game.clickOutSide();
        });

        test("Verify user can stop auto spin process by clicking on autospin button", async () => {
            let settledResultsAutoSpin = [];
            const totalAutoSpin = 10;
            await selectAutoSpin(this.game, totalAutoSpin);

            for (let index = 1; index <= totalAutoSpin - 5; index++) {
                const settledResults = await this.game.waitForSettlement();
                settledResultsAutoSpin.push(settledResults.winAmount);
            }

            await this.game.clickLocator(CSLocatorNames.btnAutoSpin); //stop autospin

            //Assert
            expect(settledResultsAutoSpin.length < 10).toBe(true);
            await this.game.waitForTimeout(longWait); //handle cases free spin or bonus
        });
    }

    protected turboTests() {
        test("Verify default state of turbo button is OFF", async () => {
            // Verify default turbo off state
            const turboOff = await this.game.captureLocator(CSLocatorNames.imgTurboOFF);

            // Assert Turbo Off
            expect(turboOff.image).toMatchSnapshot(turboOff.name);
        });

        test("Verify user can turn On turbo mode", async () => {
            // Turbo ON
            await clickTurbo(this.game);
            const turboOn = await this.game.captureLocator(CSLocatorNames.imgTurboOn);

            // Assert turbo On
            expect(turboOn.image).toMatchSnapshot(turboOn.name);
        });

        test("Verify user can turn OFF turbo mode", async () => {
            // Turbo OFF
            await clickTurbo(this.game);

            // Assert Turbo Off
            await this.game.imageExist(CSLocatorNames.imgTurboOFF);
        });
    }

    protected spinByKeys() {
        test("Verify user able spin by space with turbo mode OFF", async () => {
            //Pre-condition
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: 1 };
            await selectPayline(this.game, CSLocatorNames.btnPayline1);
            await selectBetStake(this.game, CSLocatorNames.lblBetLevel1);

            //Act
            await this.game.keyboardPress("Space");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(longWait);
        });

        test("Verify user able spin by enter key with turbo mode OFF", async () => {
            //Pre-condition
            let bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: 1 };

            //Act
            await this.game.keyboardPress("Enter");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(longWait);
        });

        test("Verify user able spin by space with turbo mode ON", async () => {
            //Pre-condition
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: 1 };
            await clickTurbo(this.game);

            //Act
            await this.game.keyboardPress("Space");
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(bet).toMatchWinningSymbols(settledResults);
            await this.game.waitForTimeout(longWait);
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" });
            const bet = { choice: `btn${this.options.placeBetChoices[0]}`, amount: 1 };
            let bettime = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "numeric", minute: "numeric" });
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBetClassicSlot(bet.choice, CSLocatorNames.lblBetLevel1);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount);
            expect(bet).toMatchWinningSymbols(settledResults);

            // Post-Act
            await this.game.waitForTimeout(longWait * 2); //handle case big win animation
            const settledata = {
                roundID: await getRoundId(this.game),
                betwin: settledResults.winAmount.toString(),
                bet: bet.amount.toString(),
                line: bet.choice,
                bettime: bettime,
                betdate: today,
            };
            global.settledata = settledata;
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Act
            await this.game.clickLocator(CSLocatorNames.mnuHamburger);
            await this.game.clickLocator(CSLocatorNames.icoHistory);
            await this.game.waitForTimeout(longWait);
            // Assert
            await this.game.captureLocator(CSLocatorNames.lblHistoryFirstRow);
            await verifyticketdata(this.game, global.settledata);

            await openRoundDetail(this.game);
            let roundID = await getRoundId(this.game, CSLocatorNames.lblHistoryDetailRoundId);
            expect.soft(roundID).toEqual(global.settledata.roundID);

            //Post-Act
            await this.game.clickLocator(CSLocatorNames.btnClosePopup);
            await this.game.waitForTimeout(mediWait);
            await this.game.clickLocator(CSLocatorNames.btnClosePopup);
            await this.game.waitForTimeout(longWait);
        });
    }

    protected guideTests() {
        test("AND player could open guide and clarify appropriate content", async () => {
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.waitForTimeout(longWait + 2000);
            await this.game.clickLocator(CSLocatorNames.mnuHamburger);
            await this.game.clickLocator(CSLocatorNames.icoGuide);
            await this.game.waitForTimeout(longWait);
            await this.game.guideImages();
            await this.game.clickLocator(CSLocatorNames.btnClosePopup);
        });
    }

    start(): void {
        test.beforeEach(async ({}, testInfo) => {
            testInfo.snapshotPath = (name: string) => {
                const snapshotPath = this.options.snapshotFolderPath + "-snapshots/" + name;

                return snapshotPath;
            };
        });

        test.use({
            gameConfigurations: this.options.gameConfiguration,
            locators: this.options.locators,
        });

        test.describe.serial(`${this.options.gameConfiguration.name} E2E Testing`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameTests();
        this.mainUITests();
        this.paylineTests();
        this.betTotalBetTests();
        this.spinByKeys();
        this.autoSpinTests();
        this.turboTests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
        this.guideTests();
    }
}

const openAutoSpinBoard = async (game: any) => {
    await game.clickOutSide();
    await game.clickLocator(CSLocatorNames.btnAutoSpin);
    await game.waitForTimeout(shortWait);
};

const selectAutoSpin = async (game: any, totalspin: number) => {
    await game.clickLocator(CSLocatorNames.btnAutoSpin);
    await game.waitForTimeout(mediWait);
    await game.clickLocator(CSLocatorNames[`btnAutoSpin${totalspin}`]);
    await game.clickLocator(CSLocatorNames.btnAutoSpinTurbo);
    await game.clickLocator(CSLocatorNames.btnAutoSpinStart);
    await game.waitForTimeout(shortWait);
};

const openPayLineBoard = async (game: any) => {
    await game.clickLocator(CSLocatorNames.btnPayline);
    await game.waitForTimeout(mediWait);
};

const selectBetChoice = async (game: any, choice: string) => {
    await game.waitForTimeout(shortWait);
    await game.clickLocator(CSLocatorNames.btnClearPayline);
    await game.clickLocator(choice);
    await game.waitForTimeout(shortWait);
};

const closePayLineBoard = async (game: any) => {
    await game.clickLocator(CSLocatorNames.btnClosePopup);
    await game.waitForTimeout(mediWait);
};

const clickTurbo = async (game: any) => {
    await game.clickLocator(CSLocatorNames.btnTurbo);
    await game.waitForTimeout(shortWait);
};

const getRoundId = async (game: any, elementname: string = CSLocatorNames.lblRoundID) => {
    await game.waitForTimeout(shortWait);
    let roundId = await game.getTextLocator(elementname);

    return typeof roundId != null ? roundId.replace(/[^0-9.]/g, "") : roundId;
};

const getDataFistRowHistory = async (game: any, elementname: string = CSLocatorNames.lblHistoryFirstRow) => {
    let tempdata = await game.getTextLocator(elementname);
    tempdata = await tempdata.split(" ");

    return {
        bettime: tempdata[0].toString(),
        betdate: tempdata[1].toString(),
        // roundID: tempdata[2].toString().replace(/[^0-9.]/g, ""), // can not getn roundID in new slots games
        bet: tempdata[2].toString().replace("'I", 1),
        line: tempdata[3].toString().replace("'I", 1),
        totalbet: tempdata[4].toString().replace("'I", 1),
        betwin: tempdata[5].toString().replaceAll("\n", ""),
    };
};

const openRoundDetail = async (game: any) => {
    await game.clickLocator(CSLocatorNames.locHistoryRoundId);
    await game.waitForTimeout(mediWait);
};

const verifyticketdata = async (game: any, expectdata: any) => {
    let line = expectdata.line.replace("btnPayline", "");
    const ticketdata = await getDataFistRowHistory(game);
    expect(ticketdata.betdate, "verify bet date").toEqual(expectdata.betdate);
    expect(ticketdata.bet).toEqual(expectdata.bet);
    expect(ticketdata.line, "verify bet bet choice").toEqual(line);
    expect(ticketdata.betwin, "verify bet win").toEqual(expectdata.betwin);
};

const selectPayline = async (game: any, payline: string) => {
    await game.clickLocator(CSLocatorNames.btnPayline);
    await game.waitForTimeout(shortWait);
    await game.clickLocator(CSLocatorNames.btnClearPayline);
    await game.clickLocator(payline);
    await game.clickLocator(CSLocatorNames.btnConfirmPayline);
    await game.waitForTimeout(shortWait);
};

const selectBetStake = async (game: any, betLevel: string) => {
    await game.clickLocator(CSLocatorNames.cboBetLevel);
    await game.waitForTimeout(shortWait);
    await game.clickLocator(betLevel);
    await game.waitForTimeout(shortWait);
};

const clickSpin = async (game: any) => {
    await game.clickLocator(CSLocatorNames.btnSpin);
    await game.waitForTimeout(shortWait);
};

const getBoardID = async () => {
    let boardId = "";
    for (let index = 0; index <= 10; index++) {
        if (logMsg[0] === "B" + index) {
            boardId = "B" + index;
            break;
        }
    }
    return boardId;
};
