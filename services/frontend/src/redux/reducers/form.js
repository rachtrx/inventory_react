import { 
    EXCEL_TOGGLE, 
    CUSTOM_TOGGLE,
    SET_FORM_DETAILS, 
    FORM_SUBMIT_START, 
    FORM_SUBMIT_SUCCESS, 
    FORM_SUBMIT_FAIL } from "../types";

const initialState = {
    mode: 'input',
    user: null,
    device: null,
    isLoading: false,
}

export function formReducer(state = initialState, action) {
    switch (action.type) {
        case FORM_SUBMIT_START:
            return {
                ...state,
                isLoading: true
            }
        case FORM_SUBMIT_SUCCESS:
            return {
                ...state,
                isLoading: false
            }
        case FORM_SUBMIT_FAIL:
            return {
                ...state,
                isLoading: false
            }
        case EXCEL_TOGGLE:
            return {
                ...state,
                mode: action.payload.submissionType
            };
        case CUSTOM_TOGGLE:
            return {
                ...state,
                
            }
        case SET_FORM_DETAILS: // for loans and returns
            return {
                ...state,
                user: action.payload.user,
                device: action.payload.device,
            };
        default:
            return state;
    }
}