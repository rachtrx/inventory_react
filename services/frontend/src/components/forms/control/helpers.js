import { LoansProvider } from '../loan/LoansProvider';
import { ReturnsProvider } from '../return/ReturnsProvider';
import { AddAssetsProvider } from '../asset/addAsset/AddAssetsProvider';
import { AddUsersProvider } from '../user/addUser/AddUsersProvider';
import { DelAssetsProvider } from '../asset/delAsset/DelAssetsProvider';
import { DelUsersProvider } from '../user/delUser/DelUsersProvider';
import { UpdateAccessoriesProvider } from '../accessories/updateAcc/UpdateAccessoriesProvider';
import { AssetTagsFormProvider } from '../asset/tags/AssetTagsProvider';
import { UserTagsFormProvider } from '../user/tags/UserTagsProvider';

import { AddAssetStep1 } from '../asset/addAsset/AddAssetStep1';
import { AddAssetStep2 } from '../asset/addAsset/AddAssetStep2';
import { DelAssetStep1 } from '../asset/delAsset/DelAssetStep1';
import { DelAssetStep2 } from '../asset/delAsset/DelAssetStep2';

import { AddUserStep1 } from '../user/addUser/AddUserStep1';
import { AddUserStep2 } from '../user/addUser/AddUserStep2';
import { DelUserStep1 } from '../user/delUser/DelUserStep1';
import { DelUserStep2 } from '../user/delUser/DelUserStep2';

import { LoanStep1 } from '../loan/LoanStep1';
import { LoanStep2 } from '../loan/LoanStep2';
import { ReturnStep1 } from '../return/ReturnStep1';
import { ReturnStep2 } from '../return/ReturnStep2';

import { UpdateAccessoryStep1 } from '../accessories/updateAcc/UpdateAccessoryStep1';
import { UpdateAccessoryStep2 } from '../accessories/updateAcc/UpdateAccessoryStep2';

import { AddAssetTagsStep1 } from '../asset/tags/addTag/AddAssetTagsStep1';
import { AddAssetTagsStep2 } from '../asset/tags/addTag/AddAssetTagsStep2';
import { DelAssetTagsStep1 } from '../asset/tags/delTag/DelAssetTagsStep1';
import { DelAssetTagsStep2 } from '../asset/tags/delTag/DelAssetTagsStep2';

import { AddUserTagsStep1 } from '../user/tags/addTag/AddUserTagsStep1';
import { AddUserTagsStep2 } from '../user/tags/addTag/AddUserTagsStep2';
import { DelUserTagsStep1 } from '../user/tags/delTag/DelUserTagsStep1';
import { DelUserTagsStep2 } from '../user/tags/delTag/DelUserTagsStep2';
import { FormType } from '../../../context/FormProvider';
import { StepProvider } from '../../../context/StepProvider';

export const formMap = {
  [FormType.ADD_ASSET]: (
    <AddAssetsProvider>
      <StepProvider>
        <AddAssetStep1 />
        <AddAssetStep2 />
      </StepProvider>
    </AddAssetsProvider>
  ),
  [FormType.DEL_ASSET]: (
    <DelAssetsProvider>
      <StepProvider>
        <DelAssetStep1 />
        <DelAssetStep2 />
      </StepProvider>
    </DelAssetsProvider>
  ),
  [FormType.ADD_USER]: (
    <AddUsersProvider>
      <StepProvider>
        <AddUserStep1 />
        <AddUserStep2 />
      </StepProvider>
    </AddUsersProvider>
  ),
  [FormType.DEL_USER]: (
    <DelUsersProvider>
      <StepProvider>
        <DelUserStep1 />
        <DelUserStep2 />
      </StepProvider>
    </DelUsersProvider>
  ),
  [FormType.LOAN]: (
    <LoansProvider>
      <StepProvider>
        <LoanStep1 />
        <LoanStep2 />
      </StepProvider>
    </LoansProvider>
  ),
  [FormType.RELOAN]: (
    <LoansProvider>
      <StepProvider>
        <LoanStep1 />
        <LoanStep2 />
      </StepProvider>
    </LoansProvider>
  ),
  [FormType.RETURN]: (
    <ReturnsProvider>
      <StepProvider>
        <ReturnStep1 />
        <ReturnStep2 />
      </StepProvider>
    </ReturnsProvider>
  ),
  [FormType.UPDATE_ACC]: (
    <UpdateAccessoriesProvider>
      <StepProvider>
        <UpdateAccessoryStep1 />
        <UpdateAccessoryStep2 />
      </StepProvider>
    </UpdateAccessoriesProvider>
  ),
  [FormType.TAG_ASSET]: (
    <AssetTagsFormProvider>
      <StepProvider>
        <AddAssetTagsStep1 />
        <AddAssetTagsStep2 />
      </StepProvider>
    </AssetTagsFormProvider>
  ),
  [FormType.UNTAG_ASSET]: (
    <AssetTagsFormProvider>
      <StepProvider>
        <DelAssetTagsStep1 />
        <DelAssetTagsStep2 />
      </StepProvider>
    </AssetTagsFormProvider>
  ),
  [FormType.TAG_USER]: (
    <UserTagsFormProvider>
      <StepProvider>
        <AddUserTagsStep1 />
        <AddUserTagsStep2 />
      </StepProvider>
    </UserTagsFormProvider>
  ),
  [FormType.UNTAG_USER]: (
    <UserTagsFormProvider>
      <StepProvider>
        <DelUserTagsStep1 />
        <DelUserTagsStep2 />
      </StepProvider>
    </UserTagsFormProvider>
  ),
};

export const headerMap = {
    [FormType.ADD_ASSET]: "Add Asset",
    [FormType.LOAN]: 'Loan',
    [FormType.RELOAN]: 'Loan',
    [FormType.RETURN]: 'Return',
    [FormType.DEL_ASSET]: "Condemn Asset",
    [FormType.ADD_USER]: "Add User",
    [FormType.DEL_USER]: "Remove User",
    [FormType.UPDATE_ACC]: "Update Accessory",
    [FormType.TAG_ASSET]: "Tag Assets",
    [FormType.UNTAG_ASSET]: "Untag Assets",
    [FormType.TAG_USER]: "Tag Users",
    [FormType.UNTAG_USER]: "Untag Users",
}

export const formStyleMap = {
  [FormType.ADD_ASSET]: {
    bg: 'bgGreen',
    _hover: { bg: 'bgGreenHover' },
  },
  [FormType.LOAN]: {
    bg: 'bgBlue',
    _hover: { bg: 'bgBlueHover' },
  },
  [FormType.RELOAN]: {
    bg: 'bgBlue',
    _hover: { bg: 'bgBlueHover' },
  },
  [FormType.RETURN]: {
    bg: 'bgOrange',
    _hover: { bg: 'bgOrangeHover' },
  },
  [FormType.DEL_ASSET]: {
    bg: 'bgRed',
    _hover: { bg: 'bgRedHover' },
  },
  [FormType.ADD_USER]: {
    bg: 'bgGreen',
    _hover: { bg: 'bgGreenHover' },
  },
  [FormType.DEL_USER]: {
    bg: 'bgRed',
    _hover: { bg: 'bgRedHover' },
  },
  [FormType.UPDATE_ACC]: {
    bg: 'bgCyan',
    _hover: { bg: 'bgCyanHover' },
  },
  [FormType.TAG_ASSET]: {
    bg: 'bgPurple',
    _hover: { bg: 'bgPurpleHover' },
  },
  [FormType.UNTAG_ASSET]: {
    bg: 'bgPink',
    _hover: { bg: 'bgPinkHover' }, // corrected
  },
  [FormType.TAG_USER]: {
    bg: 'bgPurple',
    _hover: { bg: 'bgPurpleHover' },
  },
  [FormType.UNTAG_USER]: {
    bg: 'bgPink',
    _hover: { bg: 'bgPinkHover' },
  },
};
