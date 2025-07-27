const { Op } = require("sequelize");
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType, Event } = require("@models");
const logger = require("@/utils/logging");
const UserDTO = require("@dtos/usr.dto");
const { UserCondition } = require("./userCondition");

class UserDelete {

    constructor({
        userId = null,
        deptId = null,
        ...identifiers
    }) {
        this.userCondition = new UserCondition(identifiers);
        this.userId = userId
        this.deptId = deptId
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
                                COALESCE("Loans->AstLoan->ReturnEvent"."event_date", '1970-01-01'),
                                COALESCE("Loans->AccLoans->AccReturns->ReturnEvent"."event_date", '1970-01-01')
                            )
                        `),
                        "lastEventDate" // TODO is this causing error with raw = true?
                    ]
                ],
                where: this.userCondition.query,
                include: [
                    {
                        model: Event,
                        as: "AddEvent",
                        attributes: ['eventDate'],
                    },
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
            return query.map(usrRow => new UserDTO(usrRow.dataValues).setOngoingLoans().setOngoingReservations());
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { UserDelete }