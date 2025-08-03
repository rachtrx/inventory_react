import { useItems } from "../../../context/ItemsProvider";
import { FormType, useForm } from "../../../context/FormProvider";
import { BulkActionButton } from "../../buttons/BulkActionButton";

export const LoanAll = () => {
  const { selectedItems: assets } = useItems();
  const { setInitialValues, setFormType } = useForm();

  const disabled = assets?.length && assets.some(a => a.loan?.loanId);
  const handleClick = () => {
    if (!disabled) {
      if (assets?.length) setInitialValues({assetIds: assets.map(a => a.assetId)});
      setFormType(FormType.LOAN);
    } else {
      setFormType(FormType.LOAN);
    }
  };

  return (
    <BulkActionButton onClick={handleClick} disabled={disabled}>
      Loan Assets
    </BulkActionButton>
  );
};
