import type { Page } from "@playwright/test";
import { imageType, formatScreenshotFile, formatName } from "./../_shared";

export type ImageLocatorRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type ImageSnapshot = {
    name: string;
    image: Buffer;
};

export class ImageLocator {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;

    constructor(name: string, x: number, y: number, width: number = 0, height: number = 0) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    rect(): ImageLocatorRect {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    async snapshot(page: Page): Promise<ImageSnapshot> {
        const imageName = formatName(this.name);
        const image = await page.screenshot({
            clip: this.rect(),
            path: formatScreenshotFile(this.name),
            type: imageType,
        });

        return { name: imageName, image };
    }

    async click(page: Page): Promise<void> {
        const x = this.x + this.width / 2;
        const y = this.y + this.height / 2;

        return await page.mouse.click(x, y);
    }
}
