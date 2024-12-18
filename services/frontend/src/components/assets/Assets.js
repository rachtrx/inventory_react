import AssetFilters from "./AssetFilters";
import AssetsActions from './AssetsActions';
import AssetCards from './AssetCards';
import AssetTable from "./AssetTable";
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider, useItems } from "../../context/ItemsProvider";
import assetService from "../../services/AssetService";

export const AssetsPage = () => {

  return (
    <ItemsProvider service={assetService} idField="assetId">
      <RecordsLayout
        header="Assets"
        Filters={AssetFilters}
        Actions={AssetsActions}
        Cards={AssetCards}
        Table={AssetTable}
      />
    </ItemsProvider>
  );
}
