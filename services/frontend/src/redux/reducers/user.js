import {
    USER_LOAD_START,
    USER_LOAD_SUCCESS,
    USER_LOAD_FAIL,
} from '../types'

const initialState = {
    curUser: null,
    curDevice: null,
    pastDevices: null,
    isLoading: false
}

export const userReducer = (state = initialState, action) => {
    
    switch(action.type) {
        case USER_LOAD_START:
            return {
                ...state,
                isLoading: true
            }
        case USER_LOAD_SUCCESS:
            return {
                ...state,
                curUser: action.payload.curUser,
                curDevice: action.payload.curDevice,
                pastDevices: action.payload.pastDevices,
            }
        case USER_LOAD_FAIL:
            return {
                ...state,
                curUser: null,
                curDevice: null,
                pastUsers: null
            }
        default:
            return state;
    }
}