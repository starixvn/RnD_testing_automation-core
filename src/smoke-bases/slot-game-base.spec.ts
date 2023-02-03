import { GameEvent } from "../_shared";
import { test, expect, BasePlayer, BaseGame } from "../components";
import IBaseOptions from "./base-options";

export interface SlotGameOptions extends IBaseOptions {
    placeBetChoices: string[];
    placeBetAmount?: number;
}

export class SlotGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: SlotGameOptions) {}

    protected inGameOddsTests() {
        test("AND odds should be correct", async () => {
            await this.game.waitForTimeout(this.options.waitBetTimeout);
            // Assert
            expect(this.game.odds).toStrictEqual(this.options.gameConfiguration.odds);
        });
    }

    protected placeBetAndSettleTests() {
        test("THEN player able to place a bet and settle", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            const bet = { choice: this.options.placeBetChoices[0], amount: this.options.placeBetAmount ?? 1 };
            this.game.attachSocketAndCaptureEvent(GameEvent.WinStatus);

            // Act
            const placeBetResponse = await this.player.placeBet(bet.choice, bet.amount);
            const settledResults = await this.game.waitForSettlement();

            // Assert
            expect(placeBetResponse.endBet).toBe(bet.amount * parseInt(bet.choice));
            expect(bet).toMatchWinningSlotsGame(settledResults);
        });
    }

    protected ticketHistoryTests() {
        test("AND player could open history popup", async () => {
            // Arrange
            const historyPayload = await this.player.openHistory();

            // Act
            const historySnapshot = await this.game.captureHistory();

            // Assert
            expect(historyPayload.history.betLogs.length).toBeGreaterThan(0);
            expect(historySnapshot.image).toMatchSnapshot(historySnapshot.name);
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

        test.describe.serial(`${this.options.gameConfiguration.name} Smoke Tests`, () => {
            test.beforeAll(async ({ baseGame }) => {
                this.game = baseGame;
                this.player = new BasePlayer(this.game);
            });

            this.runScenario();
        });
    }

    protected runScenario() {
        this.inGameOddsTests();
        this.placeBetAndSettleTests();
        this.ticketHistoryTests();
    }
}
