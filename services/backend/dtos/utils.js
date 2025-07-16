

exports.runInitialAstLoanCheck = (astLoan, loanModelIsChild) => {

    if (astLoan.returnEventId === undefined) throw new Error("Dev error: Include returnEventId for asset loan");

    if (loanModelIsChild) {
        if (!astLoan.loan) throw new Error("Dev error: Include loan model for asset loan");
        if (astLoan.loan.reserveEventId === undefined || astLoan.loan.loanEventId === undefined) throw new Error("Dev error: Include both reserve and loan IDs for loan model");
    }
}

exports.runInitialLoanCheck = (loan) => {
    if (loan.reserveEventId === undefined || loan.loanEventId === undefined) {
        throw new Error("Dev error: Include all event IDs to determine if loan is reserved");
    }
    if (loan.astLoan === undefined) throw new Error("Dev error: Include any asset loans for the loan");
    if (loan.accLoans === undefined) throw new Error("Dev error: Include any accessory loans for the loan");

    if (loan.astLoan && loan.astLoan.returnEventId === undefined) throw new Error("Dev error: Include return event ID for asset loan");

    if (loan.accLoans?.length) {
        loan.accLoans.forEach(accLoan => checkAccLoanHasReturns(accLoan))
    }
}

const checkAccLoanHasReturns = (accLoan) => {
    if (accLoan.count === undefined) throw new Error("Dev error: Include count for acc loan!")

    if (accLoan.accReturns === undefined) throw new Error("Dev error: Include return event ID for accessory loan");

    if (accLoan.accReturns?.some(accReturn => accReturn.count === undefined)) {
        throw new Error("Dev error: Include count for all accessory returns");
    }
}