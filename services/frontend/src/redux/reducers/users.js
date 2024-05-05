import { 
    USERS_FETCH_SUCCESS,
    USERS_FETCH_FAIL,
    USER_CREATED,
    USER_REMOVED,
    USER_BOOKMARK_TOGGLE,
    USERS_FETCH_START,
    USER_LOANED, 
    USER_RETURNED,
    CLEAR_USERS_DATA
} from '../types' 

const initialFilters = {
    dept: [],
    deviceCounts: []
}

const initialActiveFilters = {
    dept: "All",
    deviceCount: "All",
    username: "All",
    bookmarked: false
}

const initialState = {
    users: [],
    curPage: 1,
    filters: initialFilters,
    activeFilters: initialActiveFilters,
    bookmarks: [],
    isLoading: false
}


export const usersReducer = (state = initialState, action) => {

    switch (action.type) {
        case USERS_FETCH_START:
            return {
                ...state,
                isLoading: true
            }
        case USERS_FETCH_SUCCESS:
            return {
                ...state,
                users: action.payload.users,
                curPage: action.payload.page,
                bookmarks: action.payload.users
                    .filter(user => user.bookmarked === 1)
                    .map(user => user.userId),
                isLoading: false
            }
        case USERS_FETCH_FAIL:
            return {
                ...state,
                users: null,
                curPage: null,
                bookmarks: null,
                isLoading: false
            }
        case USER_CREATED:
            return {
                ...state, 
                users: [
                    ...state.users,
                    action.payload.user
                ],
                filters: {
                    // only dispatch dept if new dept
                    depts: action.payload.dept ? [...state.depts, action.payload.dept] : state.depts,
                }
            }
        case USER_LOANED: {
            const { [action.payload.userId]: removedUser, ...remainingUsers } = state.users;
            return {
                ...state,
                users: {
                    ...remainingUsers,
                    [action.payload]: {
                        ...removedUser,
                        deviceCount: removedUser.deviceCount + 1,
                        assets: removedUser.assets.append(action.payload.asset)
                    }
                },
                filters: {
                    deviceCounts: action.payload.deviceCounts
                }
            }
        }
        case USER_RETURNED: {
            const { [action.payload.userId]: removedUser, ...remainingUsers } = state.users;
            return {
                ...state,
                users: {
                    ...remainingUsers,
                    [action.payload]: {
                        ...removedUser,
                        deviceCount: removedUser.deviceCount - 1,
                        assets: removedUser.assets.filter(device => device.id !== action.payload.assetId)
                    }
                },
                filters: {
                    deviceCounts: action.payload.deviceCounts
                }
            }
        }
        case USER_REMOVED: {
            const { [action.payload]: removedUser, ...remainingUsers } = state.users;
            return {
                ...state,
                users: {
                    ...remainingUsers,
                    [action.payload]: {
                        ...removedUser,
                        removed: true
                    }
                }
            }
        }
        case USER_BOOKMARK_TOGGLE: {
            const { [action.payload]: removedUser, ...remainingUsers } = state.assets;
            return {
                ...state,
                users: {
                    ...remainingUsers,
                    [action.payload]: {
                        ...removedUser,
                        bookmarked: !removedUser.bookmarked
                    }
                },
                bookmarks: removedUser.bookmarked ? 
                    state.bookmarks.filter(user => user.userId !== action.payload) : 
                    state.bookmarks.append(action.payload)
            }
        }
        case CLEAR_USERS_DATA:
            return initialState;
        default:
            return state;
    }
}