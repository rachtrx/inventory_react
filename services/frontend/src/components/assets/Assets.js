import AssetFilters from "./AssetFilters";
import AssetActions from './AssetActions';
import AssetCards from './AssetCards';
import AssetTable from "./AssetTable";
import RecordsLayout from '../RecordsLayout';
import { useGlobal } from "../../context/GlobalProvider";

export const AssetsPage = () => {

  const { assets, loading, error } = useGlobal();

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
