const express = require('express');
const { sequelize, Vendor, Dept, Usr, AstType, AstSType, Ast, Event } = require('../models');
const { Op } = require('sequelize');
const FormHelpers = require('./formHelperController.js');
const { eventTypes } = require('./utils.js');
const { generateSecureID } = require('../utils/nanoidValidation.js');


const pythonTime = (isoString) => {
    return new Date(isoString).toISOString().slice(0, 10); // YYYY-MM-DD format
};

class FormOnboardController {

    async onboardDevice (req, res) {
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
                            id: generateSecureID(),
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
                            id: generateSecureID(),
                            deptName
                        }, { transaction });
                    }
    
                    for (const userName of usersObj[deptName]) {
                        const userExists = await Usr.findOne({
                            where: { userName: { [Op.iLike]: userName } },
                            transaction
                        });
                        if (!userExists) {
                            const newUser = await Usr.create({
                                id: generateSecureID(),
                                userName,
                                deptId: dept.id,
                                deletedDate: null,
                                bookmarked: 0
                            }, { transaction });
                            newUserIds.push(newUser.id);
                        }
                    }
                }
    
                for (const typeName in modelsObj) {
                    let type = await AstType.findOne({
                        where: { typeName: { [Op.iLike]: typeName } },
                        transaction
                    });
                    if (!type) {
                        type = await AstType.create({
                            id: generateSecureID(),
                            typeName
                        }, { transaction });
                    }
    
                    for (const subTypeName of modelsObj[typeName]) {
                        const variantExists = await AstSType.findOne({
                            where: { subTypeName: { [Op.iLike]: subTypeName }, assetTypeId: type.id },
                            transaction
                        });
                        if (!variantExists) {
                            await AstSType.create({
                                id: generateSecureID(),
                                assetTypeId: type.id,
                                subTypeName
                            }, { transaction });
                        }
                    }
                }
    
                for (const asset of assetArr) {
                    const { serialNumber, assetTag, subTypeName, userName, vendorName, addedDate, registeredRemarks, loanedDate, loanedRemarks, modelValue, bookmarked, location } = asset;
                
                    // Check for unique serial number
                    const existingSerial = await Ast.findOne({
                        where: { serialNumber: serialNumber.toUpperCase() },
                        transaction
                    });
                    if (existingSerial) {
                        throw new Error(`Serial Number ${serialNumber} already exists!`);
                    }
                
                    // Check for unique asset tag
                    const existingAssetTag = await Ast.findOne({
                        where: { assetTag: assetTag.toUpperCase() },
                        transaction
                    });
                    if (existingAssetTag) {
                        throw new Error(`Ast Tag ${assetTag} already exists!`);
                    }
                
                    if (!addedDate) {
                        throw new Error(`Ast Tag ${assetTag} has no registered date!`);
                    }
                
                    // Convert registered date from ISO string to Date object
                    const formattedAddedDate = new Date(addedDate);
                
                    // Fetch subTypeName ID based on the model name
                    const subType = await AstSType.findOne({
                        where: { subTypeName: { [Op.iLike]: subTypeName } },
                        transaction
                    });
                    if (!subType) {
                        throw new Error(`Model ${subTypeName} for Ast Tag ${assetTag} does not exist!`);
                    }
                
                    // Fetch user ID if username is provided
                    let userId = null;
                    if (userName) {
                        const user = await Usr.findOne({
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
                        throw new Error(`Vendor ${vendorName} for Ast Tag ${assetTag} does not exist!`);
                    }
                
                    const assetId = generateSecureID();
                
                    // Create new device
                    await Ast.create({
                        id: assetId,
                        serialNumber: serialNumber.toUpperCase(),
                        assetTag: assetTag.toUpperCase(),
                        subTypeId: subType.id,
                        bookmarked,
                        status: userId ? 'loaned' : 'AVAILABLE',
                        location,
                        vendorId: vendor.id,
                        userId,
                        addedDate: formattedAddedDate,
                        value: modelValue,
                    }, { transaction });
                
                    // Log 'registered' event
                    await FormHelpers.insertAssetEvent(
                        generateSecureID(),
                        assetId,
                        eventTypes.ADD_ASSET,
                        registeredRemarks,
                        null,
                        formattedAddedDate,
                        transaction
                    );
                
                    // If there's a userName, log 'loaned' event
                    if (userName) {
                        const formattedLoanedDate = new Date(loanedDate);
                        await FormHelpers.insertAssetEvent(
                            generateSecureID(),
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
    
    async checkOnboard (req, res) { // TODO check 1 by one or get all first?
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
                let exists = await Ast.findOne({
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
                let exists = await Ast.findOne({
                    where: {
                        assetTag: {
                            [sequelize.Op.iLike]: at
                        }
                    },
                    raw: true
                });
                if (exists) {
                    return res.status(400).json({ error: `Duplicate Ast Tag ${at.toUppercase()}` });
                }
            }
    
            for (let typeName of assetTypeArr) {
                let exists = await AstType.findOne({
                    where: {
                        typeName: {
                            [sequelize.Op.iLike]: typeName  // Using ILIKE
                        }
                    },
                    raw: true
                });
                if (exists) {
                    curAssetTypeArr.push(typeName);
                }
            }
    
            // Check for existing variants and correct type associations
            for (let [typeName, variantArr] of Object.entries(modelsObj)) {
                for (let subTypeName of variantArr) {
                    let found = await AstSType.findOne({
                        include: [{
                            model: AstType,
                            attributes: ['typeName']
                        }],
                        where: {
                            subTypeName: {
                                [sequelize.Op.iLike]: subTypeName
                            }
                        },
                        raw: true
                    });
                    if (found && typeName.toLowerCase() !== found['AstType.typeName'].toLowerCase()) {
                        return res.status(400).json({ error: `${subTypeName} is already registered as a ${found['AstType.typeName']}` });
                    } else if (found) {
                        curVariantArr.push(subTypeName);
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
                    let foundUser = await Usr.findOne({
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
}

module.exports = new FormOnboardController();