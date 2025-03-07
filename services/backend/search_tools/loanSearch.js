const { Op, where } = require("sequelize")
const LoanDTO = require("../dtos/loan.dto")
const { Loan, AstLoan, AccLoan, Ast, Usr, Dept, AccType, AccReturn, Sequelize, AstSType, AstType } = require("../models");
const logger = require("../logging");
const { successfulEventCondition } = require("../controllers/utils");

class LoanSearch {

    constructor({
        loanIds = [],
    }) {

        logger.info(loanIds)

        this.loanIds = loanIds;
        this.loanCondition = { id: { [Op.in]: this.loanIds } }
    }

    async run() {
        try {
            let query = await Loan.findAll({
                attributes: ['id'],
                where: loanCondition,
                include: [
                    {
                        model: Event,
                        where: successfulEventCondition(),
                        required: true,
                    },
                    {
                        model: Usr,
                        attributes: ['id', 'userName'],
                        where: [],
                        include: {
                            model: Dept,
                            attributes: ['id', 'deptName'],
                        },
                        required: true,
                    },
                    {
                        model: AccLoan,
                        attributes: ['id', 'count'],
                        include: [
                            {
                                model: AccReturn,
                                attributes: ['id', 'count']
                            },
                            {
                                model: AccType,
                                attributes: ['id', 'accessoryName'],
                                where: {}
                            }
                        ],
                        required: false
                    },
                    {
                        model: AstLoan,
                        attributes: ['id', 'returnEventId'],
                        include: {
                            model: Ast,
                            attributes: ['id', 'serialNumber', 'assetTag'],
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
                    },
                ],
            });
            return query.map(usrRow => new LoanDTO(usrRow));
        } catch (e) {
            throw e;
        }
    }
}

module.exports = { LoanSearch }