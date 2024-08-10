import AssetFilters from "./AssetFilters";
import AssetActions from './AssetActions';
import AssetCards from './AssetCards';
import AssetTable from "./AssetTable";
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider, useItems } from "../../context/ItemsProvider";
import assetService from "../../services/AssetService";

export const AssetsPage = () => {

  return (
    <ItemsProvider service={assetService}>
      <RecordsLayout
        header="Assets"
        Filters={AssetFilters}
        Actions={AssetActions}
        Cards={AssetCards}
        Table={AssetTable}
      />
    </ItemsProvider>
  );
}
