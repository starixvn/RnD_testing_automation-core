const toMatchWinning = (bet: any, settledResult: any) => {
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
};

export default toMatchWinning;
