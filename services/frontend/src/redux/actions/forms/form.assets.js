import FormService from "../../../services/FormService";
import { dispatchFormStart, dispatchFormSuccess, dispatchFormFailure } from "./helpers";

const ASSET_CREATED = 'ASSET_CREATED';
const ASSET_REGISTERED = 'ASSET_REGISTERED';
const ASSET_CONDEMNED = 'ASSET_CONDEMNED';

export const addAsset = (assetType, model) => async (dispatch) => {
    try {
        dispatchFormStart();
        await FormService.addAsset(assetType, model);
        dispatchFormSuccess(dispatch)
        dispatch({
            type: ASSET_CREATED,
            payload: {
                assetType: assetType,
                assetModel: model
            }
        })
    } catch(err) {
        dispatchFormFailure(dispatch, err)
    }
}

// register asset
export const registerAsset = (asset) => async (dispatch) => { // create the asset object in the form
    try {
        dispatchFormStart();
        await FormService.registerAsset(asset);
        dispatchFormSuccess(dispatch)
        dispatch({
            type: ASSET_REGISTERED,
            payload: asset
        })
    } catch(err) {
        dispatchFormFailure(dispatch, err)
    }
}

// condemn asset
export const condemnAsset = (assetId) => async (dispatch) => {
    try {
        dispatchFormStart();
        await FormService.condemnAsset(assetId);
        dispatchFormSuccess(dispatch)
        dispatch({
            type: ASSET_CONDEMNED,
            payload: assetId
        })
    } catch(err) {
        dispatchFormFailure(dispatch, err)
    }
}

// Permanently delete asset