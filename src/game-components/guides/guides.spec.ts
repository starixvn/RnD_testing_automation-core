import { test, BaseGame, BaseElementLocator, CSLocatorNames, ImageSnapshot } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "./guides-locators";

export class GameGuides {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests(timeout: number) {
        test("AND player could open guide and clarify appropriate content", async () => {
            // Arrange
            test.setTimeout(timeout);
            await this.game.clickGuide(3000);

            // Act
            const guideContents = await this.captureGuideContent();
            await this.game.clickLocator(CSLocatorNames.btnClosePopup);

            // Assert
            guideContents.forEach((content) => {
                expect(content.image).toMatchSnapshot(content.name);
            });
        });
    }

    async captureGuideContent(): Promise<ImageSnapshot[]> {
        const images = new Array<ImageSnapshot>();
        const guidepages = await this.game.getCountFrameLocator(GuideLocator.xpathItem);

        for (let index = 1; index <= guidepages; index++) {
            const contentFrame = new BaseElementLocator(`guide-${index}`, `${GuideLocator.xpathItem}[${index}]`);
            const contentImage = await contentFrame.snapshot(this.game.page);

            images.push(contentImage);
        }

        return images;
    }
}
