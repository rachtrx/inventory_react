import FormService from "../../../services/FormService";
import { dispatchFormStart, dispatchFormSuccess, dispatchFormFailure } from "./helpers";

const ASSET_LOANED = 'ASSET_LOANED';
const ASSET_RETURNED = 'ASSET_RETURNED';
const USER_LOANED = 'USER_LOANED';
const USER_RETURNED = 'USER_RETURNED';

// loan asset
export const loanAsset = (assetId, userId) => async (dispatch) => {
    try {
        dispatchFormStart();
        await FormService.loanAsset(assetId);
        const newDeviceCountFilters = await FormService.loanAsset(assetId); // on server side, send back new filters
        dispatchFormSuccess(dispatch);
        dispatch({
            type: ASSET_LOANED,
            payload: {
                assetId,
                userId
            }
        })
        console.log("hello");
        dispatch({
            type: USER_LOANED,
            payload: {
                assetId,
                userId,
                deviceCounts: newDeviceCountFilters
            }
        })
    } catch(err) {
        dispatchFormFailure(dispatch, err)
    }
}

// return asset
export const returnAsset = (assetId, userId) => async (dispatch) => {
    try {
        dispatchFormStart();
        await FormService.returnAsset(assetId);
        const newDeviceCountFilters = await FormService.returnAsset(assetId); // on server side, send back new filters
        dispatchFormSuccess(dispatch);
        dispatch({
            type: ASSET_RETURNED,
            payload: assetId
        })
        dispatch({
            type: USER_RETURNED,
            payload: userId,
            deviceCounts: newDeviceCountFilters
        })
    } catch(err) {
        dispatchFormFailure(dispatch, err)
    }
}