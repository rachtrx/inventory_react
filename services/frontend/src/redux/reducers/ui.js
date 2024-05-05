import {
    OPEN_DRAWER,
    CLOSE_DRAWER
} from '../types'

const initialState = {
    drawerOpen: false,
    drawerContent: null
}

export const uiReducer = (state = initialState, action) => {
    
    switch(action.type) {
        case OPEN_DRAWER:
            return {
                ...state,
                drawerOpen: true,
                drawerContent: action.payload
            }
        case CLOSE_DRAWER:
            return {
                ...state,
                drawerOpen: false,
                drawerContent: null
            }
        default:
            return state;
    }
}