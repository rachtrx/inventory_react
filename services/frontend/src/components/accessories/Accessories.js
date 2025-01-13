import AccessoryFilters from "./AccessoryFilters";
import AccessoryActions from "./AccessoryActions";
import AccessoryCards from "./AccessoryCards";
import AccessoryTable from "./AccessoryTable";
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider, useItems } from "../../context/ItemsProvider";
import accessoryService from "../../services/AccessoryService";

export const AccessoriesPage = () => {

  return (
    <ItemsProvider service={accessoryService}>
      <RecordsLayout
        header="Accessories"
        Filters={AccessoryFilters}
        Actions={AccessoryActions}
        Cards={AccessoryCards}
        Table={AccessoryTable}
      />
    </ItemsProvider>
  );
}
