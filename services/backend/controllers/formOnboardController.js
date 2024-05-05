const express = require('express');
const { sequelize, Vendor, Dept, User, AssetType, AssetTypeVariant, Asset, Event } = require('../models');
const { Op } = require('sequelize');
const { FormHelpers } = require('./formHelperController')
const uuid = require('uuid');

const pythonTime = (isoString) => {
    return new Date(isoString).toISOString().slice(0, 10); // YYYY-MM-DD format
};

exports.onboardDevice = async (req, res) => {
    const { assetArr, modelsObj, usersObj, vendorArr } = req.body;
    let newUserIds = [];

    try {
        await sequelize.transaction(async (transaction) => {
            for (const vendorName of vendorArr) {
                const existingVendor = await Vendor.findOne({
                    where: { vendorName: { [Op.iLike]: vendorName } },
                    transaction
                });
                if (!existingVendor) {
                    await Vendor.create({
                        id: uuid.v4(),
                        vendorName
                    }, { transaction });
                }
            }

            for (const deptName in usersObj) {
                let dept = await Dept.findOne({
                    where: { deptName: { [Op.iLike]: deptName } },
                    transaction
                });
                if (!dept) {
                    dept = await Dept.create({
                        id: uuid.v4(),
                        deptName
                    }, { transaction });
                }

                for (const userName of usersObj[deptName]) {
                    const userExists = await User.findOne({
                        where: { userName: { [Op.iLike]: userName } },
                        transaction
                    });
                    if (!userExists) {
                        const newUser = await User.create({
                            id: uuid.v4(),
                            userName,
                            deptId: dept.id,
                            hasResigned: 0,
                            bookmarked: 0
                        }, { transaction });
                        newUserIds.push(newUser.id);
                    }
                }
            }

            for (const assetType in modelsObj) {
                let type = await AssetType.findOne({
                    where: { assetType: { [Op.iLike]: assetType } },
                    transaction
                });
                if (!type) {
                    type = await AssetType.create({
                        id: uuid.v4(),
                        assetType
                    }, { transaction });
                }

                for (const variantName of modelsObj[assetType]) {
                    const variantExists = await AssetTypeVariant.findOne({
                        where: { variantName: { [Op.iLike]: variantName }, assetTypeId: type.id },
                        transaction
                    });
                    if (!variantExists) {
                        await AssetTypeVariant.create({
                            id: uuid.v4(),
                            assetTypeId: type.id,
                            variantName
                        }, { transaction });
                    }
                }
            }

            for (const asset of assetArr) {
                const { serialNumber, assetTag, variantName, userName, vendorName, registeredDate, registeredRemarks, loanedDate, loanedRemarks, modelValue, bookmarked, location } = asset;
            
                // Check for unique serial number
                const existingSerial = await Asset.findOne({
                    where: { serialNumber: serialNumber.toUpperCase() },
                    transaction
                });
                if (existingSerial) {
                    throw new Error(`Serial Number ${serialNumber} already exists!`);
                }
            
                // Check for unique asset tag
                const existingAssetTag = await Asset.findOne({
                    where: { assetTag: assetTag.toUpperCase() },
                    transaction
                });
                if (existingAssetTag) {
                    throw new Error(`Asset Tag ${assetTag} already exists!`);
                }
            
                if (!registeredDate) {
                    throw new Error(`Asset Tag ${assetTag} has no registered date!`);
                }
            
                // Convert registered date from ISO string to Date object
                const formattedRegisteredDate = new Date(registeredDate);
            
                // Fetch variant ID based on the model name
                const variant = await AssetTypeVariant.findOne({
                    where: { variantName: { [Op.iLike]: variantName } },
                    transaction
                });
                if (!variant) {
                    throw new Error(`Model ${variantName} for Asset Tag ${assetTag} does not exist!`);
                }
            
                // Fetch user ID if username is provided
                let userId = null;
                if (userName) {
                    const user = await User.findOne({
                        where: { userName: { [Op.iLike]: userName } },
                        transaction
                    });
                    if (!user) {
                        throw new Error(`Username ${userName} is not added`);
                    }
                    userId = user.id;
                }
            
                // Fetch vendor ID based on vendor name
                const vendor = await Vendor.findOne({
                    where: { vendorName: { [Op.iLike]: vendorName } },
                    transaction
                });
                if (!vendor) {
                    throw new Error(`Vendor ${vendorName} for Asset Tag ${assetTag} does not exist!`);
                }
            
                const assetId = uuid.v4();
            
                // Create new device
                await Asset.create({
                    id: assetId,
                    serialNumber: serialNumber.toUpperCase(),
                    assetTag: assetTag.toUpperCase(),
                    variantId: variant.id,
                    bookmarked,
                    status: userId ? 'loaned' : 'AVAILABLE',
                    location,
                    vendorId: vendor.id,
                    userId,
                    registeredDate: formattedRegisteredDate,
                    value: modelValue,
                }, { transaction });
            
                // Log 'registered' event
                await FormHelpers.insertAssetEvent(
                    uuid.v4(),
                    assetId,
                    'registered',
                    registeredRemarks,
                    null,
                    formattedRegisteredDate,
                    transaction
                );
            
                // If there's a userName, log 'loaned' event
                if (userName) {
                    const formattedLoanedDate = new Date(loanedDate);
                    await FormHelpers.insertAssetEvent(
                        uuid.v4(),
                        assetId,
                        'loaned',
                        loanedRemarks,
                        userId,
                        formattedLoanedDate,
                        transaction
                    );
                }
            }
            
            // Close the transaction block after all operations
            await transaction.commit();
        });

        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkOnboard = async (req, res) => { // TODO check 1 by one or get all first?
    const {
        deviceArr,
        modelsObj,
        usersObj,
        vendorArr,
        serialNumArr,
        assetTagArr,
        assetTypeArr,
        deptArr,
    } = req.body;

    let curAssetTypeArr = [];
    let curVariantArr = [];
    let curDeptArr = [];
    let curUserArr = [];
    let curVendorArr = [];

    try {
        for (let sn of serialNumArr) {
            let exists = await Asset.findOne({
                where: {
                    serialNumber: {
                        [sequelize.Op.iLike]: sn
                    }
                },
                raw: true
            });
            if (exists) {
                return res.status(400).json({ error: `Duplicate Serial Number ${sn.toUpperCase()}` });
            }
        }

        for (let at of assetTagArr) {
            let exists = await Asset.findOne({
                where: {
                    assetTag: {
                        [sequelize.Op.iLike]: at
                    }
                },
                raw: true
            });
            if (exists) {
                return res.status(400).json({ error: `Duplicate Asset Tag ${at.toUppercase()}` });
            }
        }

        for (let assetType of assetTypeArr) {
            let exists = await AssetType.findOne({
                where: {
                    assetType: {
                        [sequelize.Op.iLike]: assetType  // Using ILIKE
                    }
                },
                raw: true
            });
            if (exists) {
                curAssetTypeArr.push(assetType);
            }
        }

        // Check for existing variants and correct type associations
        for (let [assetType, variantArr] of Object.entries(modelsObj)) {
            for (let variant of variantArr) {
                let found = await AssetTypeVariant.findOne({
                    include: [{
                        model: AssetType,
                        attributes: ['assetType']
                    }],
                    where: {
                        variantName: {
                            [sequelize.Op.iLike]: variant
                        }
                    },
                    raw: true
                });
                if (found && assetType.toLowerCase() !== found['AssetType.assetType'].toLowerCase()) {
                    return res.status(400).json({ error: `${variant} is already registered as a ${found['AssetType.assetType']}` });
                } else if (found) {
                    curVariantArr.push(variant);
                }
            }
        }

        // Check for existing departments
        for (let dept of deptArr) {
            let exists = await Dept.findOne({
                where: {
                    deptName: {
                        [sequelize.Op.iLike]: dept  // Using ILIKE
                    }
                },
                raw: true
            });
            if (exists) {
                curDeptArr.push(dept);
            }
        }

        // Check for existing users and department consistency
        for (let [dept, userNames] of Object.entries(usersObj)) { // Allow users with same name?
            for (let userName of userNames) {
                let foundUser = await User.findOne({
                    include: [{
                        model: Dept,
                        attributes: ['deptName']
                    }],
                    where: {
                        userName: {
                            [sequelize.Op.iLike]: userName
                        }
                    },
                    raw: true
                });
                if (foundUser && dept.toLowerCase() !== foundUser['Dept.deptName'].toLowerCase()) {
                    return res.status(400).json({ error: `${userName} is already a user in ${foundUser['Dept.deptName']}` });
                } else if (foundUser) {
                    curUserArr.push(userName);
                }
            }
        }

        // Check for existing vendors
        for (let vendor of vendorArr) {
            let exists = await Vendor.findOne({
                where: {
                    vendorName: {
                        [sequelize.Op.iLike]: vendor
                    }
                },
                raw: true
            });
            if (exists) {
                curVendorArr.push(vendor);
            }
        }

        return res.json([curAssetTypeArr, curVariantArr, curDeptArr, curUserArr, curVendorArr]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}