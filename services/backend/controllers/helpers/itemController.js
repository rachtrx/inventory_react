class ItemController {

    getAllItemsEndpoint = async (req, res, next) => {
        try {
            const { filters, page = 1, limit = 30, sort } = req.query;
            const query = await this.getAllItems(filters, sort);

            const count = query.length;
            const rows = query.slice((page - 1) * limit, page * limit);
            
            const result = rows.map(row => new EventLogDTO(row));

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

    getAllItemsExcelCheckpoint = async (req, res, next) => {

    }
}

export default new ItemController();