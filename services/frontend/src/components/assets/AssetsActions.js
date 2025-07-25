import { FormType } from '../../context/ModalProvider';
import { CircleAssetActionButton } from '../buttons/actions/AssetActionButton';
import { CircleReturnButton } from '../buttons/actions/ReturnButton';

export default function AssetsActions() {

  return (
    <>
      <CircleReturnButton/>
      {[
        FormType.LOAN, 
        FormType.ADD_ASSET,
        FormType.DEL_ASSET,
        FormType.TAG_ASSET, 
        FormType.UNTAG_ASSET,
      ].map(
        (formType) => (
          <CircleAssetActionButton
            key={formType}
            formType={formType}
          />
        )
      )}
    </>
  );
}
