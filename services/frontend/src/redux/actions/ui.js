import { CLOSE_DRAWER, OPEN_DRAWER } from "../types";

export const openDrawer  = (drawerContent) => (dispatch) => {
    console.log("Before open drawer");
    console.log(drawerContent);
    dispatch({
        type: OPEN_DRAWER,
        payload: drawerContent
    })
    console.log("After open drawer");
}

export const closeDrawer = (dispatch) => {
    dispatch({
        type: CLOSE_DRAWER,
        payload: null
    })
}
