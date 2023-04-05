export enum LobbyLocator {
    memberIdInput = "input[type='number']",
    tokenBtn = "text=Get Token",
    tokenInput = "input[id=token]",
    ssoLink = "a:has-text('token')",
    advancelbl = "text=Advance",
    langDropdown = "id=language",
    vnLangOption = "vi-VN",
    enLangOption = "en-US",
    thLangOption = "th-TH",
    idLangOption = "id-ID",
    cnLangOption = "zh-CN",
    twLangOption = "zh-TW",

}

export enum SITLocator {
    memberIdInput = "id=txtID",
    pwdInput = "id=txtPW",
    loginButton = "//button",
    langDropdown = "//div[contains(@class,'c-dropdown--lang')]",
    vnLangOption = "//div[contains(text(),'Tiếng Việt')]",
}

export enum UATLocator {
    loginDiv = "id=LoginDiv",
    memberIdInput = "id=Username",
    pwdInput = "id=Password",
    loginButton = "id=LoginBtn",
    langDropdown = "id=Langid",
    vnLangOption = "vi-VN",
}

export enum PRODLocator {
    memberIdInput = "id=txtID",
    pwdInput = "id=txtPW",
    loginButton = "//a[contains(@class,'btn btn')]",
    langDropdown = "//div[contains(@class,'c-dropdown--lang')]",
    vnLangOption = "//span[text()='Tiếng Việt']",
    enLangOption = "//span[text()='English']",
    cnLangOption = "//span[text()='繁體中文']",
    jaLangOption = "//span[text()='日本語']",
}

export enum GroupCurrencyLocator {
    currencyGroupDropdown = 'xpath=//*/select[@id="group"]',
    submitButton = 'xpath=//input[@value="Submit"]',
}
