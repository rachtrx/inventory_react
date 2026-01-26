import { useItems } from "../../../context/ItemsProvider";
import { FormType, useForm } from "../../../context/FormProvider";
import { BulkActionButton } from "../../buttons/BulkActionButton";

export const UpdateAll = () => {
  const { selectedItems: accessories } = useItems();
  const { setInitialValues, setFormType } = useForm();

  const handleClick = () => {
    if (accessories?.length) setInitialValues({accTypeIds: accessories.map(a => a.accessoryTypeId)});
    setFormType(FormType.UPDATE_ACC);
  };

  return (
    <BulkActionButton onClick={handleClick} >
      {accessories?.length ? 'Update Accessories' : 'Update / Add Accessories'}
    </BulkActionButton>
  );
};
