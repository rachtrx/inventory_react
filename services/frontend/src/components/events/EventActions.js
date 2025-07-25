import { FormType } from '../../context/ModalProvider';
import { CircleAssetActionButton } from '../buttons/actions/AssetActionButton';
import { CircleReturnButton } from '../buttons/actions/ReturnButton';
import { CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { CircleUserActionButton } from '../buttons/actions/UserActionButton';

export default function EventActions() {

  return (
    <>
      <CircleReturnButton />
      {[
        FormType.LOAN,
        FormType.ADD_ASSET, 
        FormType.DEL_ASSET,
      ].map((formType) => {
        return (
          <CircleAssetActionButton
            key={formType}
            formType={formType}
          />
        );
      })}
      {[
        FormType.ADD_USER,
        FormType.DEL_USER,
      ].map((formType) => {
        return (
          <CircleUserActionButton
            key={formType}
            formType={formType}
          />
        );
      })}
      <CircleAccTypeActionButton
        key={FormType.UPDATE_ACC}
        formType={FormType.UPDATE_ACC}
      />
    </>
  );
};
