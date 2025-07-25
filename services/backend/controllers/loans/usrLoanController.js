const logger = require('@/utils/logging.js');
const { UserReturnSearch } = require('@services/search/user/userReturn.js');
const { UserLoan } = require('@services/search/user/userLoan.js');

class UsrLoanController {

    async loadUsrReturn (req, res) {
        try {
            const search = new UserReturnSearch(req.query)
            const loans = await search.run()
            loans.forEach(loan => {
                loan.value = loan.loanId;
                loan.label = loan.user.userName;
            });

            res.json(loans);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadUsrLoan (req, res) {
        try {
            const search = new UserLoan(req.query)
            const query = await search.run()

            const users = query.map(
                user => ({
                    ...user,
                    value: user.userName,
                    label: user.userName,
                    isDisabled: user.delEventId ? true : false
                })
            )
            
            res.json(users);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UsrLoanController();
