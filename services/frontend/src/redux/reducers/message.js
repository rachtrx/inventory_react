import { SET_MESSAGE, CLEAR_MESSAGE } from "../types";

const initialState = {
    title: "",
    status: ""
};

export const msgReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SET_MESSAGE:
        return { 
            title: payload.title,
            status: payload.status,
        };

    case CLEAR_MESSAGE:
    return { 
        title: "",
        status: ""
    };

    default:
      return state;
  }
}