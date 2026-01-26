import AssetFilters from "./AssetFilters";
import AssetsActions from './AssetsActions';
import AssetCards from './AssetCards';
import AssetTable from "./AssetTable";
import RecordsLayout from '../RecordsLayout';
import { ItemsProvider, useItems } from "../../context/ItemsProvider";
import assetService from "../../services/AssetService";
import { TagAll } from "./bulkActions/TagAll";
import { AssetTagsFormProvider } from "../forms/asset/tags/AssetTagsProvider";
import { useMemo } from "react";
import { ReturnAll } from "./bulkActions/ReturnAll";
import { LoanAll } from "./bulkActions/LoanAll";
import { UntagAll } from "./bulkActions/UntagAll";

export const AssetsPage = () => {

  const bulkActions = useMemo(() => [
    () => (
      <>
        <LoanAll/>
        <ReturnAll/>
        <AssetTagsFormProvider>
          <TagAll />
          <UntagAll/>
        </AssetTagsFormProvider>
      </>
    )
  ], []);

  return (
    <ItemsProvider service={assetService} itemKey="assetId" initSortField="serialNumber">
      <RecordsLayout
        header="Assets"
        Filters={AssetFilters}
        Actions={AssetsActions}
        Cards={AssetCards}
        Table={AssetTable}
        BulkActions={bulkActions}
        defaultSearches={[
          { attr: "serialNumber", label: "asset"}
        ]}
      />
    </ItemsProvider>
  );
}
