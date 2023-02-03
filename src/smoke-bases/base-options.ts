import { GameConfiguration } from "../game-configuration";
import { ImageLocator } from "../base-image-locator";

export default interface IBaseOptions {
    gameConfiguration: GameConfiguration;
    locators: ImageLocator[];
    waitBetTimeout: number;
    snapshotFolderPath: string;
    placeBetChoices: string[];
    placeBetAmount?: number;
}
