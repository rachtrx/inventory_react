import { 
    ASSETS_FETCH_SUCCESS,
    ASSETS_FETCH_FAIL,
    ASSET_CREATED,
    ASSET_REGISTERED,
    ASSET_CONDEMNED,
    ASSET_LOANED,
    ASSET_RETURNED,
    ASSET_BOOKMARK_TOGGLE,
    ASSETS_FETCH_START,
    ADD_ASSET_FILTERS,
    RESET_ASSET_FILTERS,
    UPDATE_ASSET_FILTERS,
    CLEAR_ASSETS_DATA
} from '../types' 

const initialFilters = {
    assetType: [],
    modelName: [],
    vendor: [],
    status: [],
    location: [],
}

const initialActiveFilters = {
    assetType: "All",
    modelName: "All",
    vendor: "All",
    status: "All",
    location: "All",
    assetAge: "All",
    id: "All",
    isBookmarked: false
}

const initialState = {
    items: [],
    assetModels: {},
    curPage: 1,
    bookmarks: [],
    filters: initialFilters,
    activeFilters: initialActiveFilters,
    isLoading: false
}

export const assetsReducer = (state = initialState, action) => {

    switch (action.type) {
        case ASSETS_FETCH_START:
            return {
                ...state,
                isLoading: true
            }
        case ASSETS_FETCH_SUCCESS:
            return {
                ...state,
                items: action.payload.assets,
                curPage: action.payload.curPage,
                filters: action.payload.filters,
                bookmarks: action.payload.assets
                    .filter(asset => asset.bookmarked === 1)
                    .map(asset => asset.assetId),
                isLoading: false,
            }
        case ASSETS_FETCH_FAIL:
            return {
                ...state,
                items: null,
                curPage: null,
                filters: null,
                bookmarks: null,
                isLoading: false
            }
        case ASSET_CREATED: // new asset types? and models?
            return {
                ...state, 
                filters: {
                    ...state.filters, 
                    assetModels: {
                        ...state.filters.assetModels,
                        [action.payload.assetType]: [
                            ...(state.assetModels[action.payload.assetType] || []),
                            action.payload.assetModel,
                        ],
                    }
                },
            }
        case ASSET_REGISTERED: {
            const { assetId, ...details } = action.payload;
            return {
                ...state,
                items: {
                    ...state.assets,
                    [assetId]: details,
                },
            };
        }
        case ASSET_CONDEMNED: {
            const { [action.payload]: removedDevice, ...remainingDevices } = state.assets;
            return {
                ...state,
                items: {
                    ...remainingDevices,
                    [action.payload]: {
                        ...removedDevice,
                        status: 'condemned'
                    }
                }
            }
        }
        case ASSET_LOANED: {
            const { [action.payload]: removedDevice, ...remainingDevices } = state.assets;
            return {
                ...state,
                items: {
                    ...remainingDevices,
                    [action.payload]: {
                        ...removedDevice,
                        status: 'loaned'
                    }
                }
            }
        }
        case ASSET_RETURNED: {
            const { [action.payload]: removedDevice, ...remainingDevices } = state.assets;
            return {
                ...state,
                items: {
                    ...remainingDevices,
                    [action.payload]: {
                        ...removedDevice,
                        status: 'returned'
                    }
                }
            }
        }
        case ASSET_BOOKMARK_TOGGLE:
            const { [action.payload]: removedDevice, ...remainingDevices } = state.assets;
            return {
                ...state,
                items: {
                    ...remainingDevices,
                    [action.payload]: {
                        ...removedDevice,
                        isBookmarked: !removedDevice.bookmarked
                    }
                },
                bookmarks: removedDevice.bookmarked ? 
                    state.bookmarks.filter(asset => asset.assetId !== action.payload) : 
                    state.bookmarks.append(action.payload)
            }
        case ADD_ASSET_FILTERS: // add new filters
            return {
                ...state,
                filters: state.filters[action.payload.category].append(action.payload.data)
            }
        case RESET_ASSET_FILTERS:
            return {
                ...state,
                activeFilters: initialActiveFilters
            }
        case UPDATE_ASSET_FILTERS:
            const {[action.payload.category]: _, ...otherCategories} = state.activeFilters;
            return {
                ...state,
                activeFilters: {
                    ...otherCategories,
                    [action.payload.category]: action.payload.filter
                }
            }
        case CLEAR_ASSETS_DATA:
            return initialState;
        default:
            return state;
    }
}