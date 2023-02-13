const toMatchBetOptions = (settlementResult: any, betOptions: Array<string>) => {
    const settlementBetOptions = settlementResult ? Object.keys(settlementResult) : [];

    const uniqueBetOptions = Array.from(new Set(settlementBetOptions));
    const isEqual =
        uniqueBetOptions.length === betOptions.length &&
        uniqueBetOptions.every(function (value) {
            return betOptions.includes(value);
        });

    if (isEqual) {
        return {
            message: () => "passed",
            pass: isEqual,
        };
    }

    return {
        message: () => `failed. Expected ${betOptions} but received ${settlementBetOptions}`,
        pass: isEqual,
    };
};

export default toMatchBetOptions;
