import { test, BaseGame, BaseElementLocator, CSLocatorNames, ImageSnapshot } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "../../auth/locators";

export class GameGuides {
    protected game: BaseGame;

    constructor(game: BaseGame) {
        this.game = game;
    }

    tests(timeout: number) {
        test("AND player could open guide and clarify appropriate content", async () => {
            // Arrange
            test.setTimeout(timeout);
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
