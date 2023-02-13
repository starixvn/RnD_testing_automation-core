import { expect } from "@playwright/test";
import toMatchBetOptions from "./to-match-bet-options";
import toMatchWinning from "./to-match-winning";
import toMatchWinningAndRefund from "./to-match-winning-and-refund";
import toMatchWinningSymbols from "./to-match-winning-symbols";

expect.extend({
    toMatchBetOptions,
    toMatchWinning,
    toMatchWinningAndRefund,
    toMatchWinningSymbols,
});

export { expect };
