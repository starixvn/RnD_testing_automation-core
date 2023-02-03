import { LobbyLocator, SITLocator, UATLocator, PRODLocator, GroupCurrencyLocator } from "./locators/index";
import { configs } from "./configs/config";
import { Page } from "@playwright/test";

export enum Environment {
    LOCAL = "local",
    LOCAL1 = "local1",
    LOCAL2 = "local2",
    LOCAL3 = "local3",
    SIT = "sit",
    UAT = "uat",
    PROD = "prod",
}

export const ssoToGame = async (page: Page, gameId: number = 2): Promise<void> => {
    const env = process.env.npm_config_env ?? Environment.LOCAL;
    const config = getConfig();

    //TODO account could be params
    if (config.gameAccounts[gameId] == null) {
        throw new Error(`Missing test account for game id ${gameId}!!!`);
    }

    if (env.includes("local")) {
        const memberId = config.gameAccounts[gameId][0];
        const memberSiteLink = `${config.memberSite}?obCustId=${memberId}&balance=20000`;
        await page.goto(memberSiteLink);
        const ssoLink = (await page.locator(LobbyLocator.ssoLink).textContent()) ?? "";

        await page.goto(`${ssoLink.replace("gameId=0", `gameId=${gameId}`)}`);
    } else {
        await loginMemberSite(page, config, env, gameId);
    }
};

export const getConfig = (): any => {
    const env = process.env.npm_config_env ?? Environment.LOCAL;

    return configs[env];
};

const loginMemberSite = async (page: Page, config: any, env: string, gameId: number) => {
    const accountId = config.gameAccounts[gameId][0];

    await page.goto(config.memberSite);
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });

    switch (env) {
        case Environment.UAT:
            await loginUAT(page, accountId, config.pwd);
            break;

        case Environment.PROD:
            await loginPROD(page, accountId, config.pwd);
            break;

        default:
            await loginSIT(page, accountId, config.pwd);
    }

    await goToGameLobby(page, config, gameId);

    if (env !== Environment.SIT) {
        await selectGroupCurrency(page, config.groupCurrencyId);
    }
};

const formatGameLobbyUrl = (url: string, lobbyDomain: string, operatorGameType: number): string => {
    return `${url.replace(/\/[Ss]ports/g, "").replace("demo:one23@", "")}${lobbyDomain}${operatorGameType}`;
};

const selectGroupCurrency = async (page: Page, groupCurrencyId: string) => {
    await page.selectOption(GroupCurrencyLocator.currencyGroupDropdown, { value: groupCurrencyId });
    await page.click(GroupCurrencyLocator.submitButton);

    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
};

const loginUAT = async (page: Page, accountId: string, pwd: string) => {
    await page.click(UATLocator.loginDiv);
    await page.selectOption(UATLocator.langDropdown, { value: UATLocator.vnLangOption });
    await page.fill(UATLocator.memberIdInput, accountId);
    await page.fill(UATLocator.pwdInput, pwd);
    await page.click(UATLocator.loginButton);
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
};

const loginPROD = async (page: Page, accountId: string, pwd: string) => {
    await page.fill(PRODLocator.memberIdInput, accountId);
    await page.fill(PRODLocator.pwdInput, pwd);
    await page.click(PRODLocator.loginButton);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(15000); //hard sleep when running smoke-test on CI runner
};

const loginSIT = async (page: Page, accountId: string, pwd: string) => {
    await page.fill(SITLocator.memberIdInput, accountId);
    await page.fill(SITLocator.pwdInput, pwd);
    await page.click(SITLocator.loginButton);
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
    await page.click(SITLocator.langDropdown);
    await page.click(SITLocator.vnLangOption);
};

const goToGameLobby = async (page: Page, config: any, gameId: number) => {
    await page.goto(formatGameLobbyUrl(page.url(), config.lobbyDomain, config.mapGameId[gameId]));
    await page.waitForLoadState("domcontentloaded", { timeout: 15000 });
};
