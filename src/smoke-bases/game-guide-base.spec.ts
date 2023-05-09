import { test, BasePlayer, BaseGame } from "../components";
import { IBaseOptions } from "./base-options";
import { GameGuides } from "../game-components/guides/guides.spec";

let langopt = process.env.npm_config_langopt ?? "vn";
if (process.env.npm_config_langopt == "all"){process.env.npm_config_langopt = "vn"}

export class GameGuideBase {
    game: BaseGame;
    player: BasePlayer;
    protected gameGuides: GameGuides = new GameGuides();

    constructor(protected options: IBaseOptions) {}


start(): void {
    test.beforeEach(async ({}, testInfo) => {
        testInfo.snapshotPath = (name: string) => {
            const snapshotPath = (langopt === "vn")? this.options.snapshotFolderPath + "-snapshots/" + name : this.options.snapshotFolderPath + "-snapshots/" + langopt+'/'+ name
            return snapshotPath;
        };
    });

    test.use({
        gameConfigurations: this.options.gameConfiguration,
        locators: this.options.locators,
    });

    test.describe.serial(`${this.options.gameConfiguration.name} Game Guide Testing`, () => {
        test.beforeAll(async ({ baseGame }) => {
            this.game = baseGame;
            this.player = new BasePlayer(this.game);
            this.gameGuides.init(this.game);
        });

        this.runScenario();
    });}

    protected guideTest(lang:string = "vn") {
        this.gameGuides.tests(this.options.gameConfiguration.maxTimeout, lang);
    }

    protected runScenario(){
        if(langopt == "all" && process.env.npm_config_env?.includes("local")){
            this.guideTest("vn");
            this.loginByLanguage(this.game ,"en");
            this.guideTest("en");
            this.loginByLanguage(this.game ,"tw");
            this.guideTest("tw");
            this.loginByLanguage(this.game ,"id");
            this.guideTest("id");
            this.loginByLanguage(this.game ,"th");
            this.guideTest("th");
            this.loginByLanguage(this.game ,"cn");
            this.guideTest("cn");
        }
        else if (langopt == "all"&& process.env.npm_config_env?.includes("pro")){
            this.guideTest("vn");
            this.loginByLanguage(this.game ,"en");
            this.guideTest("en");
            this.loginByLanguage(this.game ,"tw");
            this.guideTest("tw");
        }
        else
            this.guideTest(langopt);
    }

    protected async loginByLanguage(game: BaseGame, lang: string = "vn") {
        process.env.npm_config_langopt = lang;
        langopt = lang;
        await game.login();
    }
}