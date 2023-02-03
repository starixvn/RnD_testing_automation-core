import { test as base } from "@playwright/test";

import { ImageLocator } from "./base-image-locator";
import { GameConfiguration } from "./game-configuration";
import { BaseGame } from "./base-game";

type BaseFixtures = {
    gameConfigurations: GameConfiguration;
    locators: Array<ImageLocator>;
    baseGame: BaseGame;
};

export const test = base.extend<BaseFixtures>({
    gameConfigurations: new GameConfiguration(),

    locators: new Array<ImageLocator>(),

    baseGame: async ({ browser, locators, gameConfigurations }, use) => {
        const page = await browser.newPage();
        const game = new BaseGame(page, locators, gameConfigurations);
        await game.login();
        await use(game);
    },
});

test.beforeEach(async ({}, testInfo) => {
    testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;
});

test.afterAll(async ({ browser }) => {
    await browser.close();
});

export { expect } from "@playwright/test";
