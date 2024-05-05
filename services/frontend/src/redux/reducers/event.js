import {
    EVENTS_FETCH_SUCCESS,
    EVENTS_FETCH_FAIL,
    EVENT_CREATED, 
    EVENTS_FETCH_START
} from '../types' 

const initialState = {
    events: null,
    curPage: null,
    isLoading: false
}

export const eventReducer = (state = initialState, action) => {

    switch (action.type) {
        case EVENTS_FETCH_START:
            return {
                ...state,
                isLoading: true
            }
        case EVENTS_FETCH_SUCCESS:
            return {
                ...state,
                events: action.payload.events,
                isLoading: false
            }
        case EVENTS_FETCH_FAIL:
            return {
                ...state,
                events: null,
                isLoading: false
            }
        case EVENT_CREATED:
            return {
                ...state, 
                events: action.payload.events,
            }
        default:
            return state;
    }
}