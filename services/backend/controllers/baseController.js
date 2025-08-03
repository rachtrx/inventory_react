const logger = require("@/utils/logging");
const ExcelJS = require('exceljs');
class BaseController {

    constructor() {
        this.dtoCallback = (item) => item
        this.excelName = "Logs"
        this.excludedHeaders = []
    }

    getAllItemsEndpoint = async (req, res, next) => {
        try {
            const { filters, page, limit, sort } = req.query;
            console.log(req.query);
            const query = await this.getAllItems(filters, sort);

            const count = query.length;
            const rows = query.slice((page - 1) * limit, page * limit);
            
            const result = rows.map(this.dtoCallback);

            res.json({
                data: result,
                totalCount: count, // Total events count
                totalPages: Math.max(Math.ceil(count / limit), 1), // Calculate total pages
                currentPage: Math.max(parseInt(page, 10), 1)
            });
        } catch (err) {
            logger.error(err)
            next(err);
        }
    }

    getAllItemsExcelEndpoint = async (req, res, next) => {
        try {
            const { filters, sort } = req.query;

            const query = await this.getAllItems(filters, sort);
            let result = query.map(this.dtoCallback);

            const workbook = this.generateExcel(result, this.excelName, this.excludedHeaders)

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

    flattenObject(obj, prefix = '', res = {}, isRoot = true) {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
            const newPrefix = isRoot ? `${index}` : `${prefix}.${index}`;
            this.flattenObject(item, newPrefix, res, false);
            });
        } else if (obj && typeof obj === 'object') {
            for (const key in obj) {
            const newPrefix = isRoot ? key : `${prefix}.${key}`;
            this.flattenObject(obj[key], newPrefix, res, false);
            }
        } else {
            res[prefix] = obj;
        }
        return res;
    }

    generateExcel = (dataArr, worksheetName, excludedHeaders=[]) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(worksheetName);

        console.log(dataArr[4]);

        const flattenedData = dataArr.map(item => this.flattenObject(item));

        const excludeHeadersSet = new Set(excludedHeaders)

        const allHeaders = Array.from(
            new Set(flattenedData.flatMap(obj => Object.keys(obj)))
        ).filter(key => !excludeHeadersSet.has(key));

        // Add headers
        worksheet.columns = allHeaders.map(key => ({
            header: key,
            key,
            width: 20
        }));

        // Add rows
        flattenedData.forEach(item => {
            worksheet.addRow(item);
        });

        return workbook;
    }
}

module.exports = BaseController