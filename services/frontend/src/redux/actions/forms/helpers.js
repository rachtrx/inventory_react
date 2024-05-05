import { 
    CUSTOM_TOGGLE,
    EXCEL_TOGGLE,
    ASSET_BOOKMARK_TOGGLE,
    FORM_SUBMIT_START,
    FORM_SUBMIT_SUCCESS,
    FORM_SUBMIT_FAIL,
    SET_MESSAGE
} from "../../types";

export const toggleCustomInput = (dispatch) => dispatch({ type: CUSTOM_TOGGLE })

export const toggleExcelUpload = (dispatch) => dispatch({ type: EXCEL_TOGGLE })

export const toggleBookmark = (dispatch) => dispatch({ type: ASSET_BOOKMARK_TOGGLE })

export const dispatchFormStart = (dispatch) => dispatch({ type: FORM_SUBMIT_START });

export const dispatchFormSuccess = (dispatch) => dispatch({ type: FORM_SUBMIT_SUCCESS });

export const dispatchFormFailure = (dispatch, error) => {
    const message = (error.response && error.response.data && error.response.data.message) ||
        error.message || error.toString();
    dispatch({ type: FORM_SUBMIT_FAIL });
    dispatch({ type: SET_MESSAGE, payload: message });
};