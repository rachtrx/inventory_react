import { useItems } from "../../../context/ItemsProvider";
import { FormType, useForm } from "../../../context/FormProvider";
import { BulkActionButton } from "../../buttons/BulkActionButton";

export const ReturnAll = () => {
  const { selectedItems: users } = useItems();
  const { setInitialValues, setFormType } = useForm();

  const disabled = users?.length && users.some(a => !a.loans?.length);
  const handleClick = () => {
    if (!disabled) {
      if (users?.length) setInitialValues(users.flatMap(a => a.loans.map(l => l.loanId)));
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
