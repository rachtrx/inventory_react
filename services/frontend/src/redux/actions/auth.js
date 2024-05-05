// actions/auth.js
import AuthService from '../../services/AuthService';

const LOGIN_SUCCESS = "LOGIN_SUCCESS";
const LOGIN_FAIL = "LOGIN_FAIL";
const LOGOUT = "LOGOUT";
const SET_MESSAGE = "SET_MESSAGE";
const CLEAR_MESSAGE = "CLEAR_MESSAGE";

export const login = (email, password) => async (dispatch) => {
    try {
      const data = await AuthService.login(email, password);
      dispatch({
        type: LOGIN_SUCCESS,
        payload: { user: data },
      });
      return Promise.resolve();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
  
      dispatch({
        type: LOGIN_FAIL,
      });
  
      dispatch({
        type: SET_MESSAGE,
        payload: message,
      });
  
      return Promise.reject();
    }
};

export const logout = () => (dispatch) => {
  AuthService.logout();
  dispatch({
    type: LOGOUT,
  });
};

export const checkAuthStatus = () => async (dispatch) => {
  // try {
  //   const response = await AuthService.checkAuthStatus()
  //   console.log("Authenticated:", response.data.isAuthenticated);  
  //   if (response.data.isAuthenticated) {
  //     dispatch({
  //       type: LOGIN_SUCCESS,
  //     });
  //   }
  //   console.log("in checkAuth function");
  //   return Promise.resolve();
  // } catch(err) {
  //   console.log(err);
  //   dispatch({
  //     type: LOGOUT,
  //   });
  //   return Promise.reject();
  // }
}
