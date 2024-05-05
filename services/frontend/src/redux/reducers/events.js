import {
    EVENTS_FETCH_SUCCESS,
    EVENTS_FETCH_FAIL,
    EVENT_CREATED, 
    EVENTS_FETCH_START,
    CLEAR_EVENTS_DATA
} from '../types' 

const initialFilters = {
    assetType: [],
    modelName: [],
    eventType: [],
    dept: [],
}

const initialActiveFilters = {
    assetType: "All",
    modelName: "All",
    eventType: "All",
    userName: "All",
    dept: "All",
    serialNo: "All",
    assetTag: "All",
}

const initialState = {
    events: [],
    curPage: 1,
    isLoading: false,
    filters: initialFilters,
    activeFilters: initialActiveFilters
}

export const eventsReducer = (state = initialState, action) => {

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
                curPage: action.payload.page,
                filters: action.payload.filters,
                isLoading: false,
            }
        case EVENTS_FETCH_FAIL:
            return {
                ...state,
                events: [],
                curPage: 1,
                filters: {},
                isLoading: false,
            }
        case EVENT_CREATED:
            return {
                ...state, 
                events: action.payload.events,
            }
        case CLEAR_EVENTS_DATA:
            return initialState;
        default:
            return state;
    }
}