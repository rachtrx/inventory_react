import AssetService from "../../services/AssetService"

const ASSETS_FETCH_START = 'ASSETS_FETCH_START';
const ASSETS_FETCH_SUCCESS = 'ASSET_FETCH_SUCCESS';
const ASSETS_FETCH_FAIL = 'ASSET_FETCH_FAIL';

const ADD_ASSET_FILTERS = 'ADD_ASSET_FILTERS';
const RESET_ASSET_FILTERS = 'RESET_ASSET_FILTERS';
const UPDATE_ASSET_FILTERS = 'UPDATE_ASSET_FILTERS';

export const dateTimeObject = {
    weekday: 'short',
    hour: 'numeric' || '',
    minute: 'numeric' || '',
    day: 'numeric',
    month: 'short',
    year: '2-digit'
}

export const createDeviceObject = function(asset) {
    return {
      assetId: asset.asset_id || asset.id,
      serialNumber: asset.serial_number,
      assetTag: asset.asset_tag,
      modelName: asset.model_name,
      bookmarked: asset.asset_bookmarked || asset.bookmarked || 0,
      status: asset.status,
      vendorName: asset.vendor_name,
      modelValue: String(parseFloat(asset.model_value).toFixed(2)) || 'Unspecified',
      ...(asset.registered_date && {registeredDate: Intl.DateTimeFormat('en-sg', dateTimeObject).format(new Date(asset.registered_date))}),
      ...(asset.user_name && {userName: asset.user_name}),
      ...(asset.user_id && {userId: asset.user_id}),
      ...(asset.user_bookmarked && {userbookmarked: asset.user_bookmarked}),
      ...(asset.asset_type && {assetType: asset.asset_type}),
      ...(asset.location && {location: asset.location}),
      ...(asset.asset_age && {assetAge: asset.asset_age}),
      ...(asset.asset_type && {assetType: asset.asset_type})
    }
}

// set current asset
export const loadAllAssets = () => async (dispatch) => {
    dispatch({ type: ASSETS_FETCH_START });

    try {
        const response = await AssetService.loadAllAssets();
        console.log(response);
        const [ filters, result ] = response.data;

        const assets = result.map(asset => createDeviceObject(asset));

        dispatch({
            type: ASSETS_FETCH_SUCCESS,
            payload: {
                assets: assets,
                curPage: 1,
                filters: {
                    assetModels: filters.asset_models, // assuming filters has asset_models
                    vendors: filters.vendors,
                    locations: filters.locations,
                    ages: filters.ages
                }
            }
        });
    } catch (error) {
        console.error('Failed to load assets:', error);
        dispatch({ type: ASSETS_FETCH_FAIL });
        throw error;
    }
};

export const filterBookmarks = () => async (dispatch) => {
    try {
        dispatch({ type: ASSETS_FETCH_START });
        dispatch({ 
            type: UPDATE_ASSET_FILTERS,
            payload: {
                category: "bookmarked",
                filter: true
            }
        });
        dispatch({ type: ASSETS_FETCH_SUCCESS });
    } catch (error) {
        dispatch({
            type: ASSETS_FETCH_FAIL,
            payload: error,
        });
    }
}