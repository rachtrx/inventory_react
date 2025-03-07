const LoanDTO = require("../../dtos/loan.dto");

class DelAssetController {

    async loadAstDel (req, res) {
        try {
            const search = new AssetDelete(req.query)
            const query = await search.run()

            const assets = query.map(
                asset => ({
                        ...asset,
                        value: asset.serialNumber,
                        label: asset.serialNumber,
                        isDisabled: !asset.event.closedDate || asset.delEventId || !asset.astLoans || asset.astLoans.length === 0 ? false : true
                })
            )
            // console.log(assets);
            res.json(assets);
        } catch (error) {
            logger.error('Error fetching Loan:', error)
            return res.status(500).json({ error: error.message });
        }
    }

    async _validateAssetIsDeletable(assetId, t) { // IMPT TODO is this doing loadAstDel?
        const asset = await Ast.findOne({
            where: { id: assetId },
            include: [
                {
                    model: AstSType,
                    attributes: ['subTypeName'],
                    include: {
                        model: AstType,
                        attributes: ['typeName']
                    },
                },
                {
                    model: AstLoan,
                    include: {
                        model: AstReturn,
                        include: {
                            model: Event,
                            where: pendingOrCancelledEventCondition() // unreturned asset
                        },
                        required: true
                    },
                    required: false,
                },
                {
                    model: Event,
                    attributes: ['id'],
                    where: { closedDate: { [Op.eq]: null } }, // scheduled
                    required: false,
                },
                {
                    model: AstDelete,
                    include: {
                        model: Event,
                        where: successfulEventCondition() // deleted asset
                    },
                    required: false
                }
            ],
            transaction: t
        });

        return asset;
    }

    async getDelAssetIssues(req, res) {
        // check for added / scheduled / pending delete
        const { assetIds } = req.body;

        const transaction = await sequelize.transaction();

        try {
            const assets = await Promise.all(
                assetIds.map(async (assetId) => {
                    return this._validateAssetIsDeletable(assetId, transaction);
                })
            );

            if (!assets || assets.length === 0) return res.status(200)

            return res.status(500).json(assets.reduce((issues, asset) => {
                if (!issues[asset.id]) {
                    issues[asset.id] = []
                }
                issues[asset.id] = {
                    subTypeName: asset.AstSType.subTypeName,
                    typeName: asset.AstSType.AstType.typeName,
                    loans: asset.Loans.map(loan => new LoanDTO(loan)),
                    addEvent: asset.AddEvent? asset.AddEvent.get({plain: true}) : null,
                    delEvent: asset.DelEvents? asset.DelEvents.map(delEvent => delEvent.get({plain: true})) : null,
                }
            }));
        } catch (error) {
            logger.info(error)
            return res.status(500).json({ error: error.message });
        }
    }

    // SECTION POST FORM SUBMISSION

    async _dbDel(data, adminId, expectedDate=null) {
        const errors = {}

        try {
            const assetIds = new Set();
            await sequelize.transaction(async (t) => {
                for (const { assetId, serialNumber, remarks, delDate } of data) {
                    if (assetIds.has(assetId)) {
                        throw new Error("Can't delete the same device!");
                    }
                    const asset = await this._validateAssetIsDeletable(assetId);
                    
                    if (!asset) {
                        errors[assetId] = `Asset ${serialNumber} not found!`
                    }
                    
                    else if (asset.AstDeletes?.some(astDelete => !astDelete.Event.cancelled && astDelete.Event.closedDate)) {
                        errors[assetId] = `Asset ${serialNumber} is already condemned!!`
                    }

                    else if (asset.AstDeletes?.some(astDelete => astDelete.Event.cancelled)) {
                        errors[assetId] = `Asset ${serialNumber} is already scheduled for condemnation!!`
                    }
                    
                    else if (asset.AstLoans && asset.AstLoans.length > 0) {
                        errors[assetId] = `Asset ${serialNumber} is still on loan!!`
                    }
                    
                    assetIds.add(assetId);
                    
                    const delEventId = generateSecureID();

                    const curDate = new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' });
                    
                    // Create the deletion event
                    const event = await Event.create(
                        {
                            id: delEventId,
                            openedDate: curDate,
                            openedAdminId: adminId,
                            ...(expectedDate && { expectedCloseDate: expectedDate }),
                            ...(!expectedDate && {
                                closedDate: curDate,
                                closedAdminId: this.authId,
                            }),
                        },
                        { transaction: t }
                    );

                    await AstDelete.create({
                        assetId: assetId,
                        eventId: event.id
                    }, { transaction: t })
                    
                    // Add remarks if provided
                    if (remarks && remarks !== '') {
                        await Rmk.create(
                            {
                                id: generateSecureID(),
                                eventId: delEventId,
                                text: remarks,
                                remarkDate: delDate,
                                adminId: adminId,
                            },
                            { transaction: t }
                        );
                    }
                }
            });

            if (errors.length > 0) throw new ValidationError(errors);

            console.log("Finished processing asset deletions");
        } catch (error) {
            console.error("Error during asset deletion:", error);
            throw error;
        }
    }

    async scheduleDel(req, res) {
        // console.log(req.body);
        const { assets, expectedDate } = req.body; // Array of asset details
        const adminId = req.auth.id;

        try {
            await this._dbDel(assets, adminId, expectedDate)

            console.log("Finished processing asset deletions");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset deletion:", error);
            return res.status(400).json({ error: error.message });
        }
    };

    async del (req, res) {
        // console.log(req.body);
        const assets = req.body.assets; // Array of asset details
        const adminId = req.auth.id;
    
        try {
            await this._dbDel(assets, adminId)

            console.log("Finished processing asset deletions");
            return res.sendStatus(200);
        } catch (error) {
            console.error("Error during asset deletion:", error);
            return res.status(400).json({ error: error.message });
        }
    };

    // SECTION scheduled

    async _getPendingDelAssets(eventIds, transaction) {
        const pendingEvents = await Event.findAll({
            where: {
                [Op.and]: [
                    { id: { [Op.in]: eventIds } },
                    { closedDate: { [Op.eq]: null } }
                ]
            },
            include: [{
                model: Ast,
                attributes: ['serialNumber'],
                required: true,
            }],
            transaction
        });

        if (pendingEvents.length === 0) {
            throw new Error("No valid pending events found.");
        }

        return pendingEvents;
    }
    
    async cancelDelAsset(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingDelAssets(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.Ast) {
                    throw new Error(`Asset not found for event ID ${pendingEvent.id}`);
                }
    
                await pendingEvent.update(
                    {
                        closedDate: new Date(),
                        cancelled: true
                    },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Assets successfully cancelled" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }

    async confirmDelAsset(req, res) {
        const transaction = await sequelize.transaction(); // Start a manual transaction
    
        try {
            const { eventIds } = req.body;
    
            const pendingEvents = await this._getPendingDelAssets(eventIds, transaction);
    
            // Update each event in a loop
            for (const pendingEvent of pendingEvents) {
                if (!pendingEvent.Ast) {
                    throw new Error(`Asset not found for event ID ${pendingEvent.id}`);
                }
    
                await pendingEvent.update(
                    { closedDate: new Date() },
                    { transaction }
                );
            }
    
            await transaction.commit();
            return res.status(200).json({ message: "Assets successfully confirmed" });
    
        } catch (error) {
            await transaction.rollback();
            logger.info(error);
            return res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new DelAssetController();