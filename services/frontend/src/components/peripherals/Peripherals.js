import PeripheralFilters from "./PeripheralFilters";
import PeripheralActions from "./PeripheralActions";
import PeripheralCards from "./PeripheralCards";
import PeripheralTable from "./PeripheralTable";
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider, useItems } from "../../context/ItemsProvider";
import peripheralService from "../../services/PeripheralService";

export const PeripheralsPage = () => {

  return (
    <ItemsProvider service={peripheralService}>
      <RecordsLayout
        header="Peripherals"
        Filters={PeripheralFilters}
        Actions={PeripheralActions}
        Cards={PeripheralCards}
        Table={PeripheralTable}
      />
    </ItemsProvider>
  );
}
