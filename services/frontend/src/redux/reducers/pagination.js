import { SET_PAGE } from "../types"

const initialState = {
    currentPage: 1, 
    itemsPerPage: 10
}

export function paginationReducer(state = initialState, action) {
    switch (action.type) {
        case SET_PAGE:
            return { 
                ...state, 
                currentPage: action.payload
            };
        default:
            return state;
    }
}


