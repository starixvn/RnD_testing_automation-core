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
    enLangOption = "en-US",
}

export enum PRODLocator {
    memberIdInput = "id=txtID",
    pwdInput = "id=txtPW",
    loginButton = "//a[contains(@class,'btn btn')]",
    vgmemberIdInput = "id=Username",
    vgpwdInput = "id=Password",
    vgloginButton = "id=LoginBtn",
    vgiconMe = "//*[contains(@class,'icon-me')]",
    vgiconClose = "//*[@class='survey-dialog__btn-close']",
    vglangDropdown = "//*[contains(@class,'me-list')]/div[contains(@class,'list__item')][2]/div[1]",
    vgvnLangOption = "text=Tiếng Việt",
    langDropdown = "//div[contains(@class,'c-dropdown--lang')]",
    vnLangOption = "//span[text()='Tiếng Việt']",
    enLangOption = "//span[text()='English']",
    cnLangOption = "//span[text()='繁體中文']",
    twLangOption = "//span[text()='日本語']",
}

export enum GroupCurrencyLocator {
    currencyGroupDropdown = '//*/select[@id="group"]',
    submitButton = '//input[@value="Submit"]',
    specificCheckbox = 'id=groupTypeSpecific'
}
