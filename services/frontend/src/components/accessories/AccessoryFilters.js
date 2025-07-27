import InputFormControl from '../forms/utils/InputFormControl';

export default function AccessoryFilters() { // TODO can have external filters from Dashboard

    // console.log(filters.accessoryName);

  return (
    <>
        <InputFormControl
            name="accessoryName"
            label="Name"
            placeholder="Name"
        />
    </>
  );
};
