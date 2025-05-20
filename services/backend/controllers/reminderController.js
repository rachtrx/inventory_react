const { Sequelize, Admin, Ast, AccType, Usr, Loan, AstLoan, AccReturn, AccLoan, Event, Dept, AstSType, AstType, sequelize, AstTagMap, AstTag, UsrTagMap, UsrTag } = require("../models");
const logger = require('../logging.js');
const { assetTagMapQuery, userTagMapQuery, getSortCondition, generateExcel } = require("./utils.js");
const { Op } = require("sequelize");
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const EventFilterController = require("./helpers/EventFilterController.js");
const LoanDTO = require("../dtos/loan.dto.js");
class ReminderController extends EventFilterController {

	constructor() {
        super()
    }

	// async getReminders() {
	// 	try {
	// 		const reminders = await Loan.findAll({
	// 			attributes: ['expectedLoanDate', 'expectedReturnDate']
	// 		})
	// 	} catch(error) {
	// 		logger.error(error)
	// 		next(error)
	// 	}
	// }

	// async setReminders() {
	// 	try {

	// 	} catch(error) {
	// 		logger.error(error)
	// 		next(error)
	// 	}
	// }

	getAllRemindersEndpoint = async (req, res, next) => {
        try {
            const { filters, page = 1, limit = 30, sort } = req.query;
            const query = await this.getAllReminders(filters, sort);

            const count = query.length;
            const rows = query.slice((page - 1) * limit, page * limit);
            
            const result = rows.map(row => new LoanDTO(row.dataValues));

            res.json({
                data: result,
                totalCount: count, // Total events count
                totalPages: Math.ceil(count / limit), // Calculate total pages
                currentPage: parseInt(page, 10),
            });
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }

    getAllReminders = async (filters, sort) => {
    
        logger.info(filters);
		logger.info(sort)

        const sortFieldLookup = {
            "expectedReturnDate": '"expected_return_date"',
            // "admin": '"Admin"."admin_name"'
        }

        let sortCondition;
        if (sort?.length === 2) sortCondition = getSortCondition(sortFieldLookup, sort);

        const filterDefs = [
            { key: 'typeName', path: '$AstLoan->Ast->AstSType->AstType.id$' },
            { key: 'subTypeName', path: '$AstLoan->Ast->AstSType.id$' },
            { key: 'deptName', path: '$Usr->Dept.id$' },
            { key: 'userTag', path: '$Usr->UsrTag.id$' },
            { key: 'assetTag', path: '$AstLoan->Ast->AstTag.id$' },
            { key: 'admin', path: '$Admin.id$' }
		];
		
		const conditionGroups = filterDefs.flatMap(({ key, path }) =>
            filters?.[key]?.length
				? [{ [Op.or]: [{ [path]: { [Op.in]: filters[key] } }] }]
				: []
		);

		const expectedReturnDateClause = {};
		if (filters?.startDate) {
			expectedReturnDateClause[Op.gte] = new Date(filters.startDate);
		}
		if (filters?.endDate) {
			expectedReturnDateClause[Op.lte] = new Date(filters.endDate).setHours(23, 59, 59, 999);
		}

		if (expectedReturnDateClause[Op.gte] || expectedReturnDateClause[Op.lte]) {
			conditionGroups.push({ expectedReturnDate: expectedReturnDateClause });
		}
          
		const whereClause = {
			[Op.and]: [
			  ...conditionGroups,
		  
			  // Sequelize raw conditions for AstLoan / AccLoan logic
			  {
				[Op.or]: [
				  Sequelize.literal(`EXISTS (
					SELECT 1 FROM ast_loans
					WHERE ast_loans.return_event_id IS NULL
					AND ast_loans.id = "AstLoan"."id"
				  )`),
				  Sequelize.literal(`EXISTS (
					SELECT 1 FROM "acc_returns" AS "AccReturns"
					WHERE "AccReturns"."acc_loan_id" = "AccLoans"."id"
					GROUP BY "AccLoans"."id"
					HAVING COALESCE(SUM("AccReturns"."count"), 0) <= "AccLoans"."count"
				  )`)
				]
			  }
			]
		  };

        // console.log(filters.assetTag);
        const query = await Loan.findAll({
            logger: console.log,
            where: whereClause,
            include: [
                {
                    model: Event,
                    required: true,
					as: "LoanEvent",
                    // ...(filters?.startDate || filters?.endDate ? {
                    //     where: {
                    //         eventDate: {
                    //             ...(filters.startDate && { [Op.gte]: filters.startDate }),
                    //             ...(filters.endDate && { [Op.lte]: filters.endDate }),
                    //         }
                    //     }
                    // } : {}),
                    include: {
                        model: Admin,
                        required: false
                    }
                },
                {
                    model: Usr,
                    attributes: ['id', 'userName'],
                    include: [
                        {
                            model: Dept,
                            attributes: ['id', 'deptName']
                        },
                        ...(filters?.userTag ? [userTagMapQuery(filters.userTag)] : [])
                    ],
                },
                {
                    model: AstLoan,
                    required: false,
                    include: [
                        {
                            model: Ast,
                            attributes: ['id', 'serialNumber'], // todo add details so timeline can display
                            required: false,
                            include: [
                                {
                                    model: AstSType,
                                    attributes: ['id','subTypeName'],
                                    include: {
                                        model: AstType,
                                        attributes: ['id', 'typeName']
                                    },
                                },
                                ...(filters?.assetTag ? [assetTagMapQuery(filters.assetTag)] : [])
                            ]
                        }
                    ]
                },
                {
                    model: AccLoan,
                    required: false,
                    include: [
                        {
                            model: AccReturn
                        },
                        {
                            model: AccType
                        }
                    ]
                }
            ],
            order: sortCondition ? [sortCondition] : [['expectedReturnDate', 'ASC']]
        });

        return query;
    }

	async updateExpectedReturnDate (req, res) {
        const { loanIds, newReturnDate } = req.body;

        const uniqueLoanIds = [...new Set(loanIds)]; // just for sanity check

        const transaction = await sequelize.transaction();

        try {
			if (!newReturnDate) throw new Error("Return Date cannot be null")

			// Fetch the loans in the transaction context
			const loans = await Loan.findAll({
				where: { 
					id: {
						[Op.in]: uniqueLoanIds
					}
				},
				transaction
			});

			for (const loanId of uniqueLoanIds) {
				const loan = loans.find(loan => loan.id === loanId);
				if (!loan) throw new Error(`Loan ID ${loanId} not found!`)
			}

			// Update each loan and save the change within the transaction
			for (const loan of loans) {
				loan.expectedReturnDate = newReturnDate;
				await loan.save({ transaction });
			}

			await transaction.commit();
            return res.json({ message: 'All dates extended successfully.' });
        } catch (error) {
            await transaction.rollback();
            console.error("Transaction failed:", error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ReminderController();