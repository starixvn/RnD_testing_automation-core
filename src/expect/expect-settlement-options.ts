import { expect } from "@playwright/test";

expect.extend({
    toMatchBetOptions(settlementResult: any, betOptions: Array<string>) {
        const settlementBetOptions = settlementResult ? Object.keys(settlementResult) : [];

        const uniqueBetOptions = Array.from(new Set(settlementBetOptions));
        const isEqual =
            uniqueBetOptions.length === betOptions.length &&
            uniqueBetOptions.every(function (value, index) {
                return betOptions.includes(value);
            });

        if (isEqual) {
            return {
                message: () => "passed",
                pass: true,
            };
        }

        return {
            message: () => `failed. Expected ${betOptions} but received ${settlementBetOptions}`,
            pass: false,
        };
    },

    toMatchWinning(bet: any, settledResult: any) {
        const odds = settledResult.settlementResult[bet.choice] ? settledResult.odds[bet.choice] : 0;
        const expectedAmount = bet.amount * odds;

        if (expectedAmount === settledResult.winAmount) {
            return {
                message: () => "passed",
                pass: true,
            };
        }

        return {
            message: () => `failed. Expected ${expectedAmount} but received ${settledResult.winAmount}`,
            pass: false,
        };
    },

    toMatchWinningAndRefund(bet: any, settledResult: any) {
        const odds = settledResult.settlementResult[bet.choice] ? settledResult.odds[bet.choice] : 0;
        const expectedAmount = bet.refund + (bet.amount - bet.refund) * odds;

        if (expectedAmount === settledResult.winAmount) {
            return {
                message: () => "passed",
                pass: true,
            };
        }

        return {
            message: () => `failed. Expected ${expectedAmount} but received ${settledResult.winAmount}`,
            pass: false,
        };
    },

    toMatchWinningSlotsGame(bet: any, settledResult: any) {
        let expectedAmount = 0;

        if (settledResult.winAmount > 0) {
            for (const iterator of settledResult.settlementResult.winningLines) {
                expectedAmount = bet.amount * settledResult.odds[iterator.symbol][iterator.count] + expectedAmount;
            }
        }

        if (expectedAmount === settledResult.winAmount) {
            return {
                message: () => "passed",
                pass: true,
            };
        }

        return {
            message: () => `failed. Expected ${expectedAmount} but received ${settledResult.winAmount}`,
            pass: false,
        };
    },
});
