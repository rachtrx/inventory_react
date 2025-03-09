const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const AssetDTO = require("../dtos/ast.dto");
const logger = require("../logging");
const { LoanSearch } = require("./allReturn");
const UserDTO = require("../dtos/usr.dto");

class UserDelete {

    constructor({
        userNames = "",
        userId = null,
        deptId = null,
    }) {
        this.userNames = userNames
        this.userId = userId
        this.deptId = deptId

        const isBulkSearch = Array.isArray(userNames) 
        logger.info(userNames)

        this.userCondition = isBulkSearch
            ? { userName: { [Op.in]: userNames } }
            : { userName: { [Op.iLike]: `%${userNames}%` } };

        this.isBulkSearch = isBulkSearch
    }

    async run() {
        try {
            const query = await Usr.findAll({
                attributes: ['id', 'userName', 'delEventId', 
                    [
                        Sequelize.literal(`
                            GREATEST(
                                COALESCE("AddEvent"."event_date", '1970-01-01'),
                                COALESCE("Loans"."expected_loan_date", '1970-01-01'),
                                COALESCE("Loans"."expected_return_date", '1970-01-01'),
                                COALESCE("Loans->ReserveEvent"."event_date", '1970-01-01'),
                                COALESCE("Loans->LoanEvent"."event_date", '1970-01-01'),
                                COALESCE("ReturnEvent"."event_date", '1970-01-01')
                            )
                        `),
                        "lastEventDate" // TODO is this causing error with raw = true?
                    ]
                ],
                where: this.userCondition,
                include: [
                    {
                        model: Dept,
                        attributes: ['id', 'deptName'],
                        ...(this.deptId && { where: { id: this.deptId } }),
                    },
                    {
                        model: Loan,
                        include: [
                            {
                                model: Event,
                                as: "LoanEvent",
                                attributes: ['eventDate'],
                            },
                            {
                                model: Event,
                                as: "ReserveEvent",
                                attributes: ['eventDate'],
                            },
                            {
                                model: AstLoan,
                                include: {
                                    model: Event,
                                    as: "ReturnEvent",
                                    attributes: ['eventDate'],
                                },
                            },
                            {
                                model: AccLoan,
                                include: {
                                    model: AccReturn,
                                    include: {
                                        model: Event,
                                        as: "ReturnEvent",
                                        attributes: ['eventDate'],
                                    },
                                },
                            }
                        ]
                    }
                ],
                order: Sequelize.literal(`"Usr"."del_event_id" IS NOT NULL DESC`)
            })
            return query.map(usrRow => new UserDTO(usrRow).setOngoingLoans().setOngoingReservations());
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { UserDelete }