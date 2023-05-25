const toMatchWinning = (bet: any, settledResult: any) => {
    let odds: number;

    if (settledResult.winStatus) {
        odds = settledResult.settlementResult[bet.choice] ? settledResult.odds[bet.choice] : 1;
    } else if(!settledResult.winStatus) {
        odds = settledResult.settlementResult[bet.choice] ? settledResult.odds[bet.choice] : 0;
    }
    else{
        odds = 0;
    }
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
