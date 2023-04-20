import { test, BasePlayer, BaseGame } from "../components";
import { expect } from "../expects";
import { IBaseOptions } from "./base-options";
import { CSLocatorNames } from "../components/base-classic-slot-locator";
import { GuideLocator } from "../auth/locators";
import { ImageSnapshot } from "../components/base-image-locator";
import { BaseElementLocator } from "../components/base-element-locator";

export class GameGuides {

    constructor(protected game: BaseGame,protected player: BasePlayer,protected options: IBaseOptions) {
        this.game = game;
        this.player = player;
        this.options = options;
    }

    tests() {
        test("AND player could open guide and clarify appropriate content", async () => {
            // Arrange
            test.setTimeout(this.options.gameConfiguration.maxTimeout);
            await this.game.clickGuide();

            // Act
            const guideContents = await this.getFrameContent();

            // Guide locator "xpath=//*[@id='container-guide']//li[@class='guide-item']"

            // Assert
            guideContents.forEach((content) => {
                expect(content.image).toMatchSnapshot(content.name);
            });

            await this.game.clickLocator(CSLocatorNames.btnClosePopup);
        });
    }

    async getFrameContent(): Promise<ImageSnapshot[]> {
        const images = new Array<ImageSnapshot>();
        const guidepages = await this.game.getCountFrameLocator(GuideLocator.totalPages);

        for (let index = 1; index <= guidepages; index++) {
            const contentFrame = new BaseElementLocator(`guide-${index}`, `xpath=//*[@id='container-guide']//li[@class='guide-item'][${index}]`);
            const contentImage = await contentFrame.snapshot(this.game.page);

            images.push(contentImage);
        }

        return images;
    }
}
