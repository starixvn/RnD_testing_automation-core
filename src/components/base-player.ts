import { GameEvent } from "../_shared";
import { BaseGame } from "./base-game";

export class BasePlayer {
    readonly game: BaseGame;

    constructor(game: BaseGame) {
        this.game = game;
    }

    async placeHedgeBet(hedgeChoices: string[], amount: number = 1, subGameName?: string): Promise<void> {
        await this.game.waitUntilPlaceBet(subGameName);

        await this.betOn(hedgeChoices[0], amount, subGameName);
        await this.betOn(hedgeChoices[1], amount, subGameName);
    }

    async placeBet(choice: string, amount: number = 1, subGameName?: string): Promise<any> {
        if (this.game.gameConfiguration.slotsgame) {
            return await this.betOnSlot(choice, amount);
        }
        if (this.game.gameConfiguration.cardgame) {
            return await this.betOnCard(choice, amount);
        } else {
            await this.game.waitUntilPlaceBet(subGameName);

            return await this.betOn(choice, amount, subGameName);
        }
    }

    async betOn(choice: string, amount: number = 1, subGameName?: string): Promise<any> {
        await this.game.clickToChoice(choice);

        if (this.game.gameConfiguration.betBoard) {
            await this.game.clickStake(amount);
            await this.game.clickSubmitBet();
        }

        return await this.game.waitForEndBet(subGameName);
    }

    async betOnSlot(choice: string, amount: number = 1): Promise<any> {
        await this.game.clickToSlotsChoice(choice);
        await this.game.clickSubmitBet();
        await this.game.clickSlotsStake(amount);
        await this.game.clickSpin();

        return await this.game.waitForEndBet();
    }

    async betOnCard(choice: string, amount: number = 1): Promise<any> {
        await this.game.clickStake(amount);
        await this.game.clickToChoice(choice);
        await this.game.clickSubmitBet();

        return await this.game.waitForDeal();
    }

    async standCard(): Promise<any> {
        await this.game.clickStand();

        return await this.game.waitForStandBet();
    }

    async openHistory(): Promise<any> {
        this.game.attachSocketAndCaptureEvent(GameEvent.History);

        await this.game.clickHistory();

        return this.game.latestCaptureEvent(GameEvent.History);
    }

    async clickOutSide(): Promise<any> {
        await this.game.clickOutSide();
    }
}
