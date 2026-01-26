import { v4 as uuidv4 } from 'uuid';

export const createNewAccessory = (accLoan) => ({
    key: uuidv4(),
    // accessoryLoanId: accLoan.accessoryLoanId || '',
    accessoryTypeId: accLoan.accType.accessoryTypeId || '',
    accessoryName: accLoan.accType.accessoryName || '',
    unreturned: accLoan.unreturned,
    count: accLoan.unreturned,
  });

export const createNewAsset = (assetLoan={}) => ({
    assetId: assetLoan.asset?.assetId || '',
    serialNumber: assetLoan.asset?.serialNumber || '',
    unreturned: !assetLoan.asset || assetLoan.returnEventId ? 0 : 1,
    count: !assetLoan.asset || assetLoan.returnEventId ? 0 : 1,
})

export const createNewReturn = ({
    loanId = null,
    astLoan = {}, 
    user = {},
    // newUser = {},
    accLoans = [],
    remarks = null,
    search = ""
} = {}) => ({
    key: uuidv4(),
    loanId: loanId || null,
    asset: astLoan?.asset ? createNewAsset(astLoan) : {},
    accessoryTypes: accLoans?.map((accLoan) => createNewAccessory(accLoan)) || [],
    userId: user.userId || user.userId || '',
    userName: user.userName || '',
    // newUser: createNewUser(newUser),
    remarks: remarks || '',
    search: search,
});