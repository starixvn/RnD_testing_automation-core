import { test, BaseGame, BaseElementLocator, CSLocatorNames, ImageSnapshot } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "../../auth/locators";

export class GameGuides {
    protected game: BaseGame;

    init(game: BaseGame) {
        this.game = game;
    }

    tests(timeout: number) {
        test.describe("AND player could open guide and clarify appropriate content", async () => {
            let guideContents: ImageSnapshot[] = [];

            test.beforeAll(async () => {
                // Arrange
                test.setTimeout(timeout);
                await this.game.clickGuide(1000);

                // Act
                guideContents = await this.getFrameContent();
                await this.game.clickLocator(CSLocatorNames.btnClosePopup);
            });

            for (let i = 1; i < guideContents.length; i++) {
                test(`Then guide part ${i} must match snapshot `, async () => {
                    expect(guideContents[i].image).toMatchSnapshot(guideContents[i].name);
                });
            }
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
