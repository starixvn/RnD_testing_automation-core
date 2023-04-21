import { test, BaseGame, BaseElementLocator, CSLocatorNames, ImageSnapshot } from "../../components";
import { expect } from "../../expects";
import { GuideLocator } from "../../auth/locators";

export async function getFrameContent(game: BaseGame): Promise<ImageSnapshot[]> {
    const images = new Array<ImageSnapshot>();
    const guidepages = await game.getCountFrameLocator(GuideLocator.totalPages);

    for (let index = 1; index <= guidepages; index++) {
        const contentFrame = new BaseElementLocator(`guide-${index}`, `xpath=//*[@id='container-guide']//li[@class='guide-item'][${index}]`);
        const contentImage = await contentFrame.snapshot(game.page);

        images.push(contentImage);
    }

    return images;
}

export function gameGuideTests(game: BaseGame, timeout: number) {
    test("AND player could open guide and clarify appropriate content", async () => {
        // Arrange
        test.setTimeout(timeout);

        await game.clickGuide();

        // Act
        const guideContents = await getFrameContent(game);

        // Guide locator "xpath=//*[@id='container-guide']//li[@class='guide-item']"

        // Assert
        guideContents.forEach((content) => {
            expect(content.image).toMatchSnapshot(content.name);
        });

        await game.clickLocator(CSLocatorNames.btnClosePopup);
    });
}
