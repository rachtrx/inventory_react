import { loadAllAssets } from "../../redux/actions/assets";
import AssetFilters from "./AssetFilters";
import AssetActions from './AssetActions';
import AssetCards from './AssetCards';
import DataDisplayComponent from '../DataDisplayComponent';
import { AssetProvider } from "../../context/AssetProvider";
import { useAsset } from "../../context/AssetProvider";

export default function AssetsPage() {
  return (
    <AssetProvider>
      <AssetsContent />
    </AssetProvider>
  );
}

function AssetsContent() {

  const { assets, loading, error } = useAsset();

  return (
    <DataDisplayComponent
      dataKey="assets"
      data={assets}
      loading={loading}
      error={error}
      Filters={AssetFilters}
      Actions={AssetActions}
      Cards={AssetCards}
    />
  );
}