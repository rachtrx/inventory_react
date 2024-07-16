import AssetFilters from "./AssetFilters";
import AssetActions from './AssetActions';
import AssetCards from './AssetCards';
import AssetTable from "./AssetTable";
import RecordsLayout from '../RecordsLayout';
import { AssetProvider, useAsset } from "../../context/AssetProvider";
import Asset from "./Asset";
import AssetDrawer from "../ItemDrawer";

function AssetsContent() {

  const { assets, loading, error } = useAsset();

  return (
    <RecordsLayout
      header="Assets"
      data={assets}
      loading={loading}
      error={error}
      Filters={AssetFilters}
      Actions={AssetActions}
      Cards={AssetCards}
      Table={AssetTable}
    />
  );
}

export default function AssetsPage() {
  
  return (
    <AssetProvider>
      <AssetsContent />
    </AssetProvider>
  );
}

