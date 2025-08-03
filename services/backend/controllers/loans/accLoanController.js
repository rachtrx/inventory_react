const logger = require('@/utils/logging.js');
const { AccReturnSearch } = require('@services/search/accessory/accReturn.js');
const { AccLoanSearch } = require('@services/search/accessory/accLoan.js');

class AccLoanController {

    async loadAccReturn (req, res) {
        try {
            const search = new AccReturnSearch(req.query)
            const loans = await search.run()
            loans.forEach(loan => {
                loan.value = loan.loanId;
                loan.label = loan.accLoans.find(accLoan => accLoan.accType.isMatching)?.accType.accessoryName;
                loan.accLoans.sort((a, b) => {
                    // Sort by `isMatching` in descending order (true to the front)
                    return b.accType.isMatching - a.accType.isMatching;
                });
            })

            res.json(loans);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAccLoan (req, res) {
        try {

            const search = new AccLoanSearch()
            const query = await search.run()

            const accessories = query.map(
                accessory => ({
                    ...accessory,
                    value: accessory.accessoryName,
                    label: accessory.accessoryName
                })
            )
            
            res.json(accessories);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AccLoanController();
