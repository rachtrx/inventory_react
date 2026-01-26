import { useItems } from "../../../context/ItemsProvider";
import { FormType, useForm } from "../../../context/FormProvider";
import { BulkActionButton } from "../../buttons/BulkActionButton";

export const ReturnAll = () => {
  const { selectedItems: assets } = useItems();
  const { setInitialValues, setFormType } = useForm();

  const disabled = assets?.length && assets.some(a => !a.loan?.loanId);
  const handleClick = () => {
    if (!disabled) {
      if (assets?.length) setInitialValues(assets.map(a => a.loan.loanId));
      setFormType(FormType.RETURN);
    } else {
      setFormType(FormType.RETURN);
    }
  };

  return (
    <BulkActionButton onClick={handleClick} disabled={disabled}>
      Return Assets
    </BulkActionButton>
  );
};
