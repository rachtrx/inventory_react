import {
    ASSET_LOAD_START,
    ASSET_LOAD_SUCCESS,
    ASSET_LOAD_FAIL
} from '../types'

const initialState = {
    curAsset: null,
    curUser: null,
    pastUsers: null,
    isLoading: false
}

export const assetReducer = (state = initialState, action) => {
    
    switch(action.type) {
        case ASSET_LOAD_START:
            console.log("In reducer start");
            return {
                ...state,
                isLoading: true
            }
        case ASSET_LOAD_SUCCESS:
            console.log("In reducer success");
            return {
                ...state,
                curAsset: action.payload.curAsset, // dictionary of the device
                curUser: action.payload.curUser,
                pastUsers: action.payload.pastUsers,
                isLoading: false,
            }
        case ASSET_LOAD_FAIL:
            console.log("In reducer fail");
            return {
                ...state,
                curAsset: null,
                curUser: null,
                pastUsers: null,
                isLoading: false
            }
        default:
            return state;
    }
}