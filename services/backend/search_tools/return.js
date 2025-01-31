const { Op, where } = require("sequelize")
const LoanDTO = require("../dtos/loan.dto")
const { Loan, UsrLoan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const logger = require("../logging");

class ReturnSearch {

    /**
     * Constructs a new instance of the ReturnSearch class. By default, used for User and Acc search only, because it loops over loans. For assets, search is handled separately since we want to include assets that have never been loaned out, so it loops over assets themselves.
     * 
     * @param {Object} params - The parameters for initializing the ReturnSearch instance.
     * @param {number|null} params.loanId - The ID of the loan to search for. Default is null.
     */
    constructor({
        loanId = null,
        loanModelAssociation = "Loan"
    }) {
        this.loanId = loanId;
        this.loanModelAssociation = loanModelAssociation;

        logger.info(loanModelAssociation);

        this.assetAttributes = ['id', 'serialNumber', 'assetTag']
        this.userAttributes = ['id', 'userName']
        this.accessoryAttributes = ['id', 'accessoryName']

        this.loanRequirements = []
    }

    generateLoanRequirements() {
        if (this.loanId) this.loanRequirements.push({ id: this.loanId }) // TODO: eventually allow for bulk return based on ID?

        this.generateUserLoanRequirements();
        this.generateAccLoanRequirements();
    }

    generateQueries() {
        this.generateAssetQuery();
        this.generateUserQuery();
        this.generateAccessoryQuery();
    }

    updateQueries() {}

    generateUserLoanRequirements(otherConditions=null) {
        this.userLoanConditions = Sequelize.literal(`
            EXISTS (
                SELECT 1
                FROM "usr_loans" AS "UsrLoans"
                INNER JOIN "usrs" AS "UsrLoans->Usr"
                ON "UsrLoans"."user_id" = "UsrLoans->Usr"."id"
                WHERE "UsrLoans"."loan_id" = "${this.loanModelAssociation}"."id"
                ${otherConditions ? otherConditions : ""}
            )
        `)
    }

    generateAccLoanRequirements(otherConditions=null) {
        this.accessoryLoanConditions = Sequelize.literal(`
            EXISTS (
                SELECT 1
                FROM "acc_loans" AS "AccLoans"
                INNER JOIN "acc_types" AS "AccLoans->AccType"
                ON "AccLoans"."accessory_type_id" = "AccLoans->AccType"."id"
                WHERE "AccLoans"."loan_id" = "${this.loanModelAssociation}"."id"
                ${otherConditions ? otherConditions : ""}
                AND "AccLoans"."count" > (
                    SELECT COALESCE(SUM("AccLoans->AccReturns"."count"), 0)
                    FROM "acc_returns" AS "AccLoans->AccReturns"
                    WHERE "AccLoans->AccReturns"."acc_loan_id" = "AccLoans"."id"
                )
            )
        `)
    }

    generateUserQuery() {
        this.userQuery = {
            model: UsrLoan,
            include: {
                model: Usr,
                attributes: this.userAttributes,
                where: [],
                include: {
                    model: Dept,
                    attributes: ['id', 'deptName'],
                    where: {},
                }
            },
            where: this.userLoanConditions,
            required: true
        }
    }

    generateAccessoryQuery() {
        this.accessoryQuery = {
            model: AccLoan,
            attributes: ['id', 'count'],
            include: [
                {
                    model: AccReturn,
                    attributes: ['id', 'count']
                },
                {
                    model: AccType,
                    attributes: this.accessoryAttributes,
                    where: {}
                }
            ],
            where: this.accessoryLoanConditions,
            required: false
        }
    }

    generateAssetQuery() {
        this.assetQuery = {
            model: AstLoan,
            attributes: ['id', 'returnEventId'],
            include: {
                model: Ast,
                attributes: this.assetAttributes,
                include: {
                    model: AstSType,
                    attributes: ['subTypeName'],
                    include: {
                        model: AstType,
                        attributes: ['typeName'],                           
                        required: true,
                    },
                    required: true,
                },
            },
            required: false
        }
    }

    async run() {
        try {
            let query = await Loan.findAll(this.loanQuery);
            return query.map(loanRow => new LoanDTO(loanRow));
        } catch(e) {
            throw e;
        }
    }

    async runAll() {

        if (this.loanRequirements?.length > 1) {
            this.loanCondition = {
                where: {
                    [Op.and]: this.loanRequirements
                }
            }
        } else if (this.loanRequirements?.length === 1) {
            this.loanCondition = {
                where: this.loanRequirements[0]
            }
        }

        try {
            this.generateLoanRequirements();
            this.generateQueries();
            this.updateQueries();

            this.loanQuery = {
                attributes: ['id', 'loanEventId', 'reserveEventId', 'cancelEventId'],
                include: [
                    this.assetQuery, this.userQuery, this.accessoryQuery
                ],
                ...(this.loanCondition ? this.loanCondition : []),
                ...(this.order ? this.order : [])
            }

            const response = await this.run();
            logger.info(response);
            return response;
        } catch(e) {
            throw e;
        };
    }
}

module.exports = { ReturnSearch }