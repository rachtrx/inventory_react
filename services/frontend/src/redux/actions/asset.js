import AssetService from "../../services/AssetService"

const ASSET_LOAD_START = 'ASSET_LOAD_START';
const ASSET_LOAD_SUCCESS = 'ASSET_LOAD_SUCCESS';
const ASSET_LOAD_FAIL = 'ASSET_LOAD_FAIL';
const ASSET_BOOKMARK_TOGGLE = 'ASSET_BOOKMARK_CREATED';
const SET_MESSAGE = "SET_MESSAGE";

// set current asset
export const loadCurrentAsset = (assetId) => async (dispatch) => {
    try {
        dispatch({ type: ASSET_LOAD_START });
        const response = await AssetService.loadFullAssetDetails(assetId);
        dispatch({
            type: ASSET_LOAD_SUCCESS,
            payload: response.data,
        });
    } catch (error) {
        dispatch({
            type: ASSET_LOAD_FAIL,
            payload: error,
        });
    }
}

// bookmark asset
export const bookmarkAsset = (assetId, assetTag) => async (dispatch) => {
    try {
        await AssetService.bookmarkAsset(assetId);
        dispatch({
            type: SET_MESSAGE,
            payload: `${assetTag} was bookmarked successfully`
        })
        dispatch({
            type: ASSET_BOOKMARK_TOGGLE,
            payload: assetId
        })
    } catch (error) {
        dispatch({
            type: ASSET_LOAD_FAIL,
            payload: error,
        });
        dispatch({
            type: SET_MESSAGE,
            payload: `Bookmark for ${assetTag} failed`
        })
    }
}