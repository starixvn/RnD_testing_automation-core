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

export const ssoToGame = async (page: Page, gameId: number, playerId: string, productId: string, env: string): Promise<void> => {
    const config = getConfig();

    if (playerId === "" || productId === "") {
        throw new Error(`Missing Test Account or ProductId for game id ${gameId}!!!`);
    }

    if (env.includes("local")) {
        const memberSiteLink = `${config.memberSite}?obCustId=${playerId}&balance=20000`;
        await page.goto(memberSiteLink);
        console.log('Login Local',memberSiteLink);
        const ssoLink = (await page.locator(LobbyLocator.ssoLink).textContent()) ?? "";

        await page.goto(`${ssoLink.replace("gameId=0", `gameId=${gameId}`)}`);
    } else {
        await loginMemberSite(page, config, env, playerId, productId);
    }
};

export const getConfig = (): any => {
    const env = (process.env.npm_config_env ?? Environment.LOCAL).toLowerCase();

    return configs[env];
};

const loginMemberSite = async (page: Page, config: any, env: string, playerId: string, productId: string) => {
    const timeout = config.lobbyTimeout;

    await page.goto(config.memberSite);
    console.log('Login Member Site: ',config.memberSite); 
    await page.waitForLoadState("domcontentloaded", { timeout });

    switch (env) {
        case Environment.UAT:
            await loginUAT(page, playerId, config.pwd, timeout);
            break;

        case Environment.PROD:
            await loginPROD(page, playerId, config.pwd, timeout);
            break;

        default:
            await loginSIT(page, playerId, config.pwd, timeout);
    }

    await goToGameLobby(page, config, productId);

    if (mustSelectCurrencyGroup(env)) {
        await selectCurrencyGroup(page, config.groupCurrencyId, timeout);
    }
};

const selectCurrencyGroup = async (page: Page, groupCurrencyId: string, timeout: number = 15000) => {
    await page.selectOption(GroupCurrencyLocator.currencyGroupDropdown, { value: groupCurrencyId });
    await page.click(GroupCurrencyLocator.submitButton);

    await page.waitForLoadState("domcontentloaded", { timeout });
};

const loginUAT = async (page: Page, playerId: string, pwd: string, timeout: number = 15000) => {
    await page.click(UATLocator.loginDiv);
    await page.selectOption(UATLocator.langDropdown, { value: UATLocator.vnLangOption });
    await page.fill(UATLocator.memberIdInput, playerId);
    await page.fill(UATLocator.pwdInput, pwd);
    await page.click(UATLocator.loginButton);
    await page.waitForLoadState("domcontentloaded", { timeout });
};

const loginPROD = async (page: Page, accountId: string, pwd: string, timeout: number = 15000) => {
    await page.fill(PRODLocator.memberIdInput, accountId);
    await page.fill(PRODLocator.pwdInput, pwd);
    await page.click(PRODLocator.loginButton);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(timeout); //hard sleep when running smoke-test on CI runner
};

const loginSIT = async (page: Page, accountId: string, pwd: string, timeout: number = 15000) => {
    await page.fill(SITLocator.memberIdInput, accountId);
    await page.fill(SITLocator.pwdInput, pwd);
    await page.click(SITLocator.loginButton);
    await page.waitForLoadState("domcontentloaded", { timeout });
    await page.click(SITLocator.langDropdown);
    await page.click(SITLocator.vnLangOption);
};

const goToGameLobby = async (page: Page, config: any, productId: string, timeout: number = 15000) => {
    await page.goto(formatGameLobbyUrl(page.url(), config.lobbyDomain, productId));
    await page.waitForLoadState("domcontentloaded", { timeout });
};

const formatGameLobbyUrl = (url: string, lobbyDomain: string, productId: string): string => {
    return `${url.replace(/\/[Ss]ports/g, "").replace("demo:one23@", "")}${lobbyDomain}${productId}`;
};

const mustSelectCurrencyGroup = (env: string): boolean => {
    return env !== Environment.SIT;
};
