import { useItems } from "../../../context/ItemsProvider";
import { FormType, useForm } from "../../../context/FormProvider";
import { BulkActionButton } from "../../buttons/BulkActionButton";

export const LoanAll = () => {
  const { selectedItems: users } = useItems();
  const { setInitialValues, setFormType } = useForm();

  const disabled = users?.length && users.some(u => u.delEvent);
  const handleClick = () => {
    if (!disabled) {
      if (users?.length) setInitialValues({userIds: users.map(u => u.userId)});
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
