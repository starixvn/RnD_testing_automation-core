import type { Page } from "@playwright/test";
import { formatScreenshotFile, formatName } from "../_shared";
import { ImageSnapshot } from "./base-image-locator";

export class BaseElementLocator {
    element: string;
    name: string;

    constructor(name: string, element: string) {
        this.element = element;
        this.name = name;
    }

    async snapshot(page: Page, isFrame = true): Promise<ImageSnapshot> {
        const imageName = formatName(this.name);

        const root = isFrame ? page.frameLocator("iframe") : page;
        const image = await root.locator(this.element).screenshot({ path: formatScreenshotFile(this.name) });

        return { name: imageName, image };
    }
}
