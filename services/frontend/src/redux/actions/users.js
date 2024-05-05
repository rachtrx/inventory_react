import UserService from "../../services/UserService";

const USERS_FETCH_START = 'USERS_FETCH_START';
const USERS_FETCH_SUCCESS = 'USER_FETCH_SUCCESS';
const USERS_FETCH_FAIL = 'USER_FETCH_FAIL';

const USER_CREATED = 'USER_CREATED';
const USER_REMOVED = 'USER_REMOVED';
const USER_LOANED = 'USER_LOANED';
const USER_RETURNED = 'USER_RETURNED';
const USER_BOOKMARK_TOGGLE = 'USER_BOOKMARK_CREATED';

const USER_LOAD_START = 'USER_LOAD_START';
const USER_LOAD_SUCCESS = 'USER_LOAD_SUCCESS';
const USER_LOAD_FAIL = 'USER_LOAD_FAIL';

const ADD_USER_FILTERS = 'ADD_USER_FILTERS';
const RESET_USER_FILTERS = 'RESET_USER_FILTERS';
const UPDATE_USER_FILTERS = 'UPDATE_USER_FILTERS';

export const createUserObject = function(user) {
    return {
        userId: user.user_id || user.id,
        userName: user.user_name,
        deptName: user.dept_name,
        bookmarked: user.user_bookmarked || user.bookmarked || 0,
        hasResigned: user.has_resigned || 0,
        ...(user.asset_tag && user.model_name && user.asset_id && user.device_bookmarked !== undefined && {
            device: {
                assetTag: user.asset_tag,
                modelName: user.model_name,
                assetId: user.asset_id,
                bookmarked: user.device_bookmarked,
            }
        }),
    }
}

// function takes an array of users and filters them based on whether they already have a device
export const combinedUsers = function(usersArray) {
    return usersArray.reduce((users, user) => {
        // existingUser will return the user if found
        const existingUser = users.find((filteredUser) => filteredUser.userId === user.userId);
        if (existingUser) {
            // User already exists, add the device details to the existing user's users array
            existingUser.devices.push(user.device);
            existingUser.deviceCount = user.device ? existingUser.deviceCount++ : existingUser.deviceCount
        } else {
            // TODO check on the count
            // Create a new user object with the device details
            const newUser = {
            userId: user.userId,
            userName: user.userName,
            deptName: user.deptName,
            bookmarked: user.bookmarked || 0,
            hasResigned: user.hasResigned || 0,
            ...(user.device && {devices: [user.device]}),
            deviceCount: user.device ? 1 : 0,
            }
            users.push(newUser);
        }
        return users;
    }, []);
}
  
  // LOAD USERS
export const loadAllUsers = () => async (dispatch) => {
    try {
        dispatch({ type: USERS_FETCH_START });
        const [result, depts] = await UserService.loadAllUsers();
        if (!result) return
        const users = combinedUsers(result.map(user => createUserObject(user)))
        const deviceCounts = [...new Set(users.map((user) => user.deviceCount))].sort((a, b) => a - b);
        dispatch({
            type: USERS_FETCH_SUCCESS,
            payload: {
                users: users,
                curPage: 1,
                filters: {
                    depts: depts,
                    deviceCounts: deviceCounts
                }
            }
        });
  
    } catch(err) {
        throw err;
    }
}