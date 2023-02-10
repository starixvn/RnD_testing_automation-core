import { test, expect, BasePlayer, BaseGame } from "../components";
import { IBaseOptions } from "./base-options";
import { MiniGameBase } from "./mini-game-base.spec";

export class TableGameBase extends MiniGameBase {
    game: BaseGame;
    player: BasePlayer;

    constructor(protected options: IBaseOptions) {
        super(options);
    }

    protected inGameDealerTests() {
        test("GIVEN player joined game and saw dealer", async () => {
            // Act
            const dealerSnapshot = await this.game.captureDealer();

            // Assert
            expect(dealerSnapshot.image).toMatchSnapshot(dealerSnapshot.name);
        });
    }

    protected override runScenario(): void {
        this.inGameDealerTests();

        super.runScenario();
    }
}
