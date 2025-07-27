const AccLoanDTO = require('@/dtos/accLoan.dto');
const { Loan, AstLoan, AccLoan, Event, AccType, Ast, Sequelize } = require('@/models');
const logger = require('@/utils/logging.js');
const { AssetLoan } = require('@/services/search/asset/assetLoan.js');
const { AssetReturn } = require('@services/search/asset/assetReturn.js');

class AstLoanController {
    async loadAstReturn (req, res) {
        try {
            const search = new AssetReturn(req.query, false)
            const assets = await search.run()

            const loans = assets.flatMap(
                asset => {
                    const assetCopy = JSON.parse(JSON.stringify(asset));
                    delete assetCopy.astLoans;

                    if (!asset.astLoans?.length) { // simulate a loan structure
                        return [{
                            astLoan: {
                                asset: assetCopy
                            },
                            value: asset.serialNumber,
                            label: asset.serialNumber,
                            isDisabled: true
                        }];
                    } else {
                        const trueLoans = []
                        asset.astLoans.forEach(astLoan => { // IMPT since 1 to 1, can flatmap without worrying about duplicate assetLoan across assets
                            const loan = astLoan.loan;
                            delete astLoan.loan;
                            loan.astLoan = astLoan;
                            loan.astLoan.asset = assetCopy;

                            trueLoans.push({
                                ...loan,
                                value: loan.loanId,
                                label: asset.serialNumber,
                                isDisabled: loan.reserveEventId && !loan.loanEventId ? true : false // reserved but not loaned yet                            
                            })
                        })
                        return trueLoans
                    }
                }
            )
            // console.log(loans);
            res.json(loans);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadAstLoan (req, res) {
        try {
            const search = new AssetLoan(req.query)
            const query = await search.run()

            const assets = query.map(
                asset => ({
                    ...asset,
                    value: asset.serialNumber,
                    label: asset.serialNumber,
                    isDisabled: (asset.delEventId || asset.loan || asset.reservation) ? true : false
                })
            )
            
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async loadSuggestedAccLoan (req, res) {

        const astSTypeId = req.params.astSTypeId;
        
        try {
            let astLoans = await AstLoan.findAll({
                include: [
                    {
                        model: Ast,
                        where: { subTypeId: astSTypeId },
                    },
                    {
                        model: Loan,
                        attributes: ['id'],
                        include: [
                            {
                                model: AccLoan,
                                required: false,
                                include: {
                                    model: AccType,
                                    required: true
                                }
                            },
                            {
                                model: Event,
                                as: 'LoanEvent'
                            }
                        ]
                    }
                ],
                limit: 5,
                order: [[{ model: Loan }, { model: Event, as: 'LoanEvent' }, 'event_date', 'DESC']]
            })

            const seen = new Set();
            const uniqueCombinations = [];

            for (const astLoan of astLoans) {
                const accLoans = astLoan.Loan?.AccLoans;
                if (!accLoans?.length) continue;

                const signature = accLoans
                    .map(accLoan => ({
                    accessoryTypeId: accLoan.accessoryTypeId,
                    count: accLoan.count
                    }))
                    .sort((a, b) => a.accessoryTypeId.localeCompare(b.accessoryTypeId))
                    .map(acc => `${acc.accessoryTypeId}:${acc.count}`)
                    .join('|');

                if (seen.has(signature)) continue;
                seen.add(signature);

                const eventDate = astLoan.Loan?.LoanEvent?.eventDate || null;

                const formatted = accLoans
                    .map(accLoan => new AccLoanDTO(accLoan))
                    .sort((a, b) => a.accType.accessoryName.localeCompare(b.accType.accessoryName))
                    .map(accLoan => ({
                        ...accLoan.accType,
                        count: accLoan.count,
                        eventDate
                    }));

                uniqueCombinations.push(formatted);
            }

            return res.json(uniqueCombinations || [])
        } catch (error) {
            logger.error(error)
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AstLoanController();
