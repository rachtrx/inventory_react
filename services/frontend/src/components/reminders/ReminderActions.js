import { FormType } from '../../context/FormProvider';
import { CircleAssetActionButton } from '../buttons/actions/AssetActionButton';
import { CircleReturnButton } from '../buttons/actions/ReturnButton';

export default function ReminderActions() {

  return (
    <>
      <CircleReturnButton />
      <CircleAssetActionButton formType={FormType.LOAN} />
    </>
  );
};
