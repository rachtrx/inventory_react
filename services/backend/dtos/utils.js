exports.runInitialLoanCheck = (loan) => {
    if (loan.reserveEventId === undefined || loan.loanEventId === undefined || loan.cancelEventId === undefined) {
        throw new Error("Dev error: Include all event IDs to determine if loan is reserved");
    }
    if (loan.AstLoan === undefined) throw new Error("Dev error: Include any asset loans for the loan");
    if (loan.AccLoans === undefined) throw new Error("Dev error: Include any accessory loans for the loan");

    if (loan.AstLoan && loan.AstLoan.returnEventId === undefined) throw new Error("Dev error: Include return event ID for asset loan");

    if (loan.AccLoans?.length) {
        loan.AccLoans.forEach(accLoan => {
            if (accLoan.AccReturns === undefined) throw new Error("Dev error: Include return event ID for accessory loan");

            if (accLoan.AccReturns?.some(accReturn => accReturn.returnEventId === undefined)) {
                throw new Error("Dev error: Include return event ID for all accessory returns");
            }
        })
    }
}