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
            query.forEach(usrRow => {
                const toMs = (d) => {
                    if (!d) return 0; // epoch fallback
                    const ms = new Date(d).getTime();
                    return Number.isFinite(ms) ? ms : 0;
                };

                let lastMs = toMs(usrRow.AddEvent?.eventDate);

                for (const loan of (usrRow.Loans ?? [])) {
                    const astReturnMs = toMs(loan.AstLoan?.ReturnEvent?.eventDate);
                    if (astReturnMs) {
                        lastMs = Math.max(lastMs, astReturnMs);
                        continue;
                    }
                    // get max of all loan.AccLoans' return event dates
                    for (const accLoan of (loan.AccLoans ?? [])) {
                        const accReturnMs = toMs(accLoan.AccReturns?.ReturnEvent?.eventDate);
                        if (accReturnMs) {
                            lastMs = Math.max(lastMs, accReturnMs);
                        }
                    }
                    if (loan.AccLoans) continue;
                    

                    const loanMs = toMs(loan.LoanEvent?.eventDate);
                    const reserveMs = toMs(loan.ReserveEvent?.eventDate);
                    lastMs = Math.max(lastMs, loanMs, reserveMs);
                }

                // store as ISO string (or keep ms if you prefer)
                usrRow.dataValues.lastEventDate = new Date(lastMs).toISOString();
            });
            return query.map(usrRow => new UserDTO(usrRow.dataValues).setOngoingLoans().setOngoingReservations());
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { UserDelete }