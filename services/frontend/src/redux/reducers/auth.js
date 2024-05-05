import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from '../types';

const accessToken = localStorage.getItem('accessToken');
const user = localStorage.getItem('user');

const initialState = {
  accessToken: accessToken || null,
  user: user || null,
  isLoggedIn: !!accessToken && !!user
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        // user: action.payload.user || state.user,
      };
    case LOGIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        // user: null,
        accessToken: null
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        // user: null,
        accessToken: null
      };
    default:
      return state;
  }
};
  