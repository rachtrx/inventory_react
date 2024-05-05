import FormService from "../../../services/FormService";
import { dispatchFormStart, dispatchFormSuccess, dispatchFormFailure } from "./helpers";

const USER_CREATED = 'USER_CREATED';
const USER_REMOVED = 'USER_REMOVED';


export const addUser = (dept, user) => async (dispatch) => {
    try {
        dispatchFormStart();
        await FormService.addUser(dept, user);
        dispatchFormSuccess(dispatch)
        dispatch({
            type: USER_CREATED,
            payload: {
                dept: dept,
                user: user
            }
        })
    } catch(err) {
        dispatchFormFailure(dispatch, err)
    }
}

export const removeUser = (userId) => async (dispatch) => {
    try {
        dispatchFormStart();
        await FormService.removeUser(userId);
        dispatchFormSuccess(dispatch)
        dispatch({
            type: USER_REMOVED,
            payload: userId
        })
    } catch(err) {
        dispatchFormFailure(dispatch, err)
    }
}