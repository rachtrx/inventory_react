const { Sequelize, Admin, Ast, AccType, Usr, Loan, AstLoan, AccReturn, AccLoan, Event, Dept, AstSType, AstType, sequelize, AstTagMap, AstTag, UsrTagMap, UsrTag } = require("../models");
const logger = require('../logging.js');
const { assetTagMapQuery, userTagMapQuery, getSortCondition, generateExcel } = require("./utils.js");
const { Op } = require("sequelize");
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const EventFilterController = require("./helpers/eventFilterController.js");
const LoanDTO = require("../dtos/loan.dto.js");
class ReminderController extends EventFilterController {

	constructor() {
        super()
    }

    getAllRemindersEndpoint = async (req, res, next) => {
        try {
            const { filters, page = 1, limit = 30, sort } = req.query;
            const query = await this.getReminders(filters, sort);

            const count = query.length;
            const rows = query.slice((page - 1) * limit, page * limit);
            
            const result = rows.map(row => new LoanDTO(row.dataValues));

            res.json({
                data: result,
                totalCount: count, // Total assets count
                totalPages: Math.max(Math.ceil(count / limit), 1), // Calculate total pages
                currentPage: Math.max(parseInt(page, 10), 1)
            });
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }

    getAllRemindersExcelEndpoint = async (req, res, next) => {
        try {
            const { filters, sort } = req.query;

            const query = await this.getReminders(filters, sort);
            const result = query.map(row => new LoanDTO(row.dataValues));

            const workbook = generateExcel(result, 'User Logs', ['checked'])

            // Prepare response headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="event_logs.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }

    getReminders = async (filters, sort) => {
    
        logger.info(filters);
		logger.info(sort)

        const sortFieldLookup = {
            "expectedReturnDate": '"expected_return_date"',
            // "admin": '"Admin"."admin_name"'
        }

        let sortCondition;
        if (sort?.length === 2) sortCondition = getSortCondition(sortFieldLookup, sort);

        const filterDefs = [
			{ key: 'typeName', path: '$AstLoan->Ast->AstSType->AstType.id$', op: Op.in },
			{ key: 'subTypeName', path: '$AstLoan->Ast->AstSType.id$', op: Op.in },
			{ key: 'deptName', path: '$Usr->Dept.id$', op: Op.in },
			{ key: 'userTag', path: '$Usr->UsrTag.id$', op: Op.in },
			{ key: 'assetTag', path: '$AstLoan->Ast->AstTag.id$', op: Op.in },
			{ key: 'admin', path: '$Admin.id$', op: Op.in },
			{ key: 'userName', path: '$Usr.user_name$', op: Op.iLike },
			{ key: 'serialNumber', path: '$AstLoan->Ast.serial_number$', op: Op.iLike }
		];
		
		const conditionGroups = filterDefs.flatMap(({ key, path, op }) => {
			const val = filters?.[key];
			if (!val || val.length === 0) return [];
		
			// Handle iLike as partial string match
			if (op === Op.iLike) {
				return [{ [Op.or]: [{ [path]: { [Op.iLike]: `%${val}%` } }] }];
			}
		
			// Handle normal IN array match
			return [{ [Op.or]: [{ [path]: { [Op.in]: val } }] }];
		});

        conditionGroups.push({ loanEventId: { [Op.ne]: null }})

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
			  Loan.TOP_LEVEL_ON_LOAN_WHERE_CLAUSE
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