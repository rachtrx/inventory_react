import AssetFilters from "./AssetFilters";
import AssetsActions from './AssetsActions';
import AssetCards from './AssetCards';
import AssetTable from "./AssetTable";
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider, useItems } from "../../context/ItemsProvider";
import assetService from "../../services/AssetService";

export const AssetsPage = () => {

  // console.log(process.env.NODE_ENV)

  return (
    <ItemsProvider service={assetService} itemKey="assetId" initSortField="serialNumber">
      <RecordsLayout
        header="Assets"
        Filters={AssetFilters}
        Actions={AssetsActions}
        Cards={AssetCards}
        Table={AssetTable}
        defaultSearches={[
          { attr: "serialNumber", label: "asset"}
        ]}
      />
    </ItemsProvider>
  );
}
