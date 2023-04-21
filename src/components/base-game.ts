import type { Page } from "@playwright/test";
import type { WebSocket as PlaywrightWs } from "playwright-core";
import { GameEvent, waitForMessage, parseSocketPayload } from "./../_shared";
import { ssoToGame, getConfig } from "./../auth/auth";
import { ImageLocator, ImageSnapshot } from "./base-image-locator";
import { GameConfiguration } from "./game-configuration";
import { Tesseract } from "tesseract.ts";
import { CSLocatorNames } from "../components/base-classic-slot-locator";
import { expect } from "@playwright/test";

export class BaseGame {
    readonly LobbyTimeout: number = 60000;
    readonly BetBoardPostfix: string = "BetBoard";

    readonly page: Page;
    readonly locators: Array<ImageLocator>;
    readonly gameConfiguration: GameConfiguration;

    msgpack: boolean;
    gameSocket: PlaywrightWs;
    capturedEvents: any;
    odds: any = null;

    constructor(page: Page, locators: Array<ImageLocator>, gameConfiguration: GameConfiguration) {
        this.page = page;
        this.locators = locators;
        this.gameConfiguration = gameConfiguration;
        this.capturedEvents = {};
    }

    async login() {
        const env = (process.env.npm_config_env ?? "local").toLowerCase();
        await ssoToGame(this.page, this.gameConfiguration.id, this.gameConfiguration.accounts[env], this.gameConfiguration.productId, env);
        this.msgpack = getConfig().enabledMsgPack;
        this.page.on("websocket", async (ws) => {
            if (ws.url().includes(this.gameConfiguration.socketName ?? this.gameConfiguration.name.toLowerCase())) {
                this.gameSocket = ws;

                ws.on("framereceived", async (msg: any) => {
                    const { payload } = msg ?? "";

                    if (this.odds === null && payload.includes(GameEvent.GameConfig)) {
                        const ingameResponse = parseSocketPayload(payload, this.msgpack).message;
                        this.odds = ingameResponse.gameConfigs.odds;
                    }

                    Object.keys(this.capturedEvents)?.forEach((event) => {
                        if (payload.includes(event)) {
                            this.capturedEvents[event] = parseSocketPayload(payload, this.msgpack).message;
                        }
                    });
                });
            }
        });
        await this.logConsole();
        await this.page.waitForTimeout(this.LobbyTimeout);
    }

    async getTextLocator(locatorName: string) {
        const buffer = await this.capture(locatorName);
        const data = await Tesseract.recognize(buffer.image);
        return data.text.length > 1 ? data.text : null;
    }

    attachSocketAndCaptureEvent(event: string) {
        this.capturedEvents[event] = "";
    }

    latestCaptureEvent(event: string): any | undefined {
        const message = this.capturedEvents[event];
        delete this.capturedEvents[event];

        return message;
    }

    private getGameName(subGameName?: string): string {
        return subGameName ?? this.gameConfiguration.name;
    }

    async waitForEvent(event: string, subGameName?: string): Promise<any> {
        return await waitForMessage(this.gameSocket, event, this.getGameName(subGameName), this.msgpack);
    }

    async waitUntilNextRound(subGameName?: string): Promise<any> {
        this.capturedEvents[GameEvent.WinStatus] = "";

        return await this.waitForEvent(GameEvent.StartRound, subGameName);
    }

    async waitUntilPlaceBet(subGameName?: string): Promise<void> {
        const { wholeRound, placingBets } = this.gameConfiguration.durations;
        await this.waitUntilNextRound(subGameName);
        await this.page.waitForTimeout(wholeRound - placingBets);
    }

    async waitForEndBet(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.EndBet, subGameName);
    }

    async waitForDeal(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.Deal, subGameName);
    }

    async waitForEndDeal(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.EndDeal, subGameName);
    }

    async waitForStandBet(subGameName?: string): Promise<any> {
        return await this.waitForEvent(GameEvent.Stand, subGameName);
    }

    async waitForSettlement(subGameName?: string): Promise<any> {
        const message = await this.waitForEvent(GameEvent.Settlement, subGameName);
        await this.page.waitForTimeout(500); // add sleep due to feature Publish round result prior to settlement
        const winningByChoice = this.latestCaptureEvent(GameEvent.WinStatus);

        let settledResults = {
            settlementResult: message?.finish?.settlementResult,
            odds: this.odds,
        };
        if (this.gameConfiguration.slotsgame) {
            settledResults["winAmount"] = message?.finish?.betWin ?? 0;
        } else {
            settledResults["winAmount"] = winningByChoice.status.win ? winningByChoice.status.bet : 0;
        }
        return settledResults;
    }

    async waitForTimeout(time: number = 5000): Promise<void> {
        await this.page.waitForTimeout(time);
    }

    async capture(locatorName: string): Promise<ImageSnapshot> {
        const locator = this.locator(locatorName);

        return locator ? await locator.snapshot(this.page) : Promise.resolve({ name: "", image: Buffer.from("") });
    }

    async captureDealer(): Promise<ImageSnapshot> {
        return this.capture("dealer");
    }

    async captureChoice(choice: string): Promise<ImageSnapshot> {
        return this.capture(`${choice}Choice`);
    }

    async captureOwnbet(choice: string): Promise<ImageSnapshot> {
        return this.capture(`${choice}Ownbet`);
    }

    async captureHistory(): Promise<ImageSnapshot> {
        return this.capture(`historyPopup`);
    }

    async captureLocator(locator: string): Promise<ImageSnapshot> {
        return this.capture(locator);
    }

    async clickToChoice(choice: string): Promise<void> {
        const postfix = this.gameConfiguration.betBoard ? this.BetBoardPostfix : "";
        await this.clickLocator(`${choice}Choice${postfix}`);
    }

    async clickToSlotsChoice(choice: string): Promise<void> {
        await this.clickLocator("choiceMenu");
        await this.waitForTimeout(500);
        await this.clickLocator("clearChoices");
        await this.clickLocator(`${choice}Choice`);
    }

    async clickLocator(element: string): Promise<void> {
        const locator = this.locator(element);
        if (locator) {
            await locator.click(this.page);
        }
    }

    locator(name: string): ImageLocator | undefined {
        return this.locators.find((x) => x.name === name);
    }

    async clickHistory(): Promise<void> {
        if (this.locator("hamburgerMenu")) {
            await this.locator("hamburgerMenu")?.click(this.page);
            await this.waitForTimeout(500);
        }

        await this.locator("historyMenu")?.click(this.page);
        await this.waitForTimeout(1000);
    }

    async clickGuide(): Promise<void> {
        if (this.locator("hamburgerMenu")) {
            await this.clickLocator("hamburgerMenu");
            await this.waitForTimeout(500);
        }

        await this.clickLocator("guideMenu");
        await this.waitForTimeout(3000);
    }

    async getGuideContent() {
        let getguidecontent = this.page.frameLocator("iframe").locator("id=container-guide").textContent();
        return getguidecontent;
    }

    async captureErrorMessage(): Promise<ImageSnapshot> {
        return this.capture(`errorMessage`);
    }

    async captureErrorBetLimit(): Promise<ImageSnapshot> {
        return this.capture(`msgMaxbetLimit`);
    }

    async clickStake(amount: number = 1): Promise<void> {
        await this.locator(`stake${amount}`)?.click(this.page);
    }

    async clickStand(): Promise<void> {
        await this.waitForTimeout(6000);
        await this.clickLocator("standcard");
    }

    async clickHit(): Promise<void> {
        await this.locator("hitcard")?.click(this.page);
    }

    async clickSlotsStake(amount: number = 1): Promise<void> {
        await this.clickLocator("stakeMenu");
        await this.waitForTimeout(500);
        await this.clickLocator(`stake${amount}`);
    }

    async clickSubmitBet(): Promise<void> {
        await this.waitForTimeout(500);
        await this.locator(`submit${this.BetBoardPostfix}`)?.click(this.page);
    }

    async clickSpin(): Promise<void> {
        await this.waitForTimeout(500);
        const locator = this.locator("spin");
        if (locator) {
            await locator.click(this.page);
        } else {
            await this.clickLocator(CSLocatorNames.btnSpin);
        }
    }

    async clickOutSide(): Promise<void> {
        const locator = this.locator("outside");
        if (locator) {
            await locator.click(this.page);
        } else {
            await this.clickLocator(CSLocatorNames.btnClosePopup);
        }
        await this.waitForTimeout(500);
    }

    async mouseDragDrop(from: Pos, to: Pos): Promise<void> {
        let xPos = from.xPos,
            yPos = from.yPos;
        await this.page.mouse.move(xPos, yPos);
        await this.page.mouse.down();
        await this.page.waitForTimeout(500);
        (xPos = to.xPos), (yPos = to.yPos);
        await this.page.mouse.move(xPos, yPos);
        await this.page.waitForTimeout(1000);
        await this.page.mouse.up();
    }

    async mouseWhell(to: Pos): Promise<void> {
        let xPos = to.xPos,
            yPos = to.yPos;
        await this.page.mouse.wheel(xPos, yPos);
    }

    async getCountFrameLocator(locator: string) {
        return this.page.frameLocator("iframe").locator(locator).count();
    }

    async captureFrameLocator(locator: string, path: string) {
        return this.page.frameLocator("iframe").locator(locator).screenshot({ path: path });
    }

    async keyboardPress(key: string) {
        return this.page.keyboard.press(key);
    }

    async logConsole() {
        this.page.on("console", (msg) => {
            if (msg.text().length < 3) {
                global.logMsg.push(msg.text());
            }
            console.log(msg.text());
        });
    }

    async imageExist(image: string): Promise<void> {
        const captureimage = await this.captureLocator(image);
        expect(captureimage.image, `verify ${image}`).toMatchSnapshot(image + ".png");
    }

    async guideImages(): Promise<void> {
        let totalItems = await this.getCountFrameLocator("xpath=//*[@id='container-guide']//li[@class='guide-item']");
        for (let index = 1; index <= totalItems; index++) {
            let tempimage = await this.captureFrameLocator(
                `xpath=//*[@id='container-guide']//li[@class='guide-item'][${index}]`,
                `screenshots/imgGuide${index}.png`
            );
            expect(tempimage).toMatchSnapshot(`imgGuide${index}.png`);
        }
    }
}

export interface Pos {
    xPos: number;
    yPos: number;
}
