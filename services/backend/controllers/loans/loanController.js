const { sequelize, Event } = require('../../models/index.js');
const logger = require('../../utils/logging.js');
const path = require('path');
const LoanService = require('@services/loans/loanService.js');
const ReturnService = require('@services/loans/returnService.js');
const { ReturnSearch } = require('@services/search/allReturn.js');

// req.file.filename, // Accessing the filename
// req.file.path,     // Accessing the full path
// req.file.size,     // Accessing the file size
// req.file.mimetype  // Accessing the MIME type

class LoanController {

    async loan (req, res) {
        // logger.info(req.body);
        const { users } = req.body;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            const loanService = new LoanService(users, req.auth.id, transaction);

            await loanService.processLoans();
            await transaction.commit();

            return res.json({ message: 'All assets processed successfully.' });
        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };
    
    async return (req, res) {
        const { returns } = req.body;

        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            const returnService = new ReturnService(returns, req.auth.id, transaction);

            await returnService.processReturns();
            await transaction.commit();

            return res.json({ message: 'All items returned successfully.' });
        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    };

    async loadReturn (req, res) {
        try {
            const search = new ReturnSearch(req.body)
            const loans = await search.run()
            loans.forEach(loan => {
                loan.value = loan.loanId;
                loan.label = loan.user.userName;
            });

            res.json(loans);
        } catch (error) {
            logger.error('Error fetching returns:', error)
            return res.status(500).json({ error: error.message });
        }
    }
    
    async downloadEvent (req, res) {
        const id = req.body.id;
    
        try {
            const event = await Event.findById(id);
            if (!event) {
                return res.status(404).send('Event not found.');
            }
    
            const filePath = path.join(uploadPath, event.filePath);
            // console.log(filePath);
    
            res.download(filePath, event.filePath, { headers: { 'Content-Type': 'application/pdf' } });
        } catch (error) {
            console.error("Error downloading file:", error);
            res.status(500).send({ error: error.message });
        }
    };
}

module.exports = new LoanController();
