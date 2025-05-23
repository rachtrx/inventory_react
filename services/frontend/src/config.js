import chroma from "chroma-js";
import axios from 'axios';
import { EventEmitter } from 'events';

export const TIMEOUT_SEC = 300;
export const PREVIEW_TIMEOUT_BLUR = 100;
export const RES_PER_PAGE = 30;
export const API_URL = `${process.env.REACT_APP_API_BASE_URL}`;

export const eventBus = new EventEmitter();

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

// Response interceptor for handling token refresh.
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Prevent interceptor loop: if the request is to an auth endpoint, reject immediately.
    if (
      originalRequest.url.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    // Check if error is a 401 and that we haven't already retried the request.
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the access token.
        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        // If refresh is successful, retry the original request.
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Emit a global logout event so subscribers (like AuthProvider) can react.
        eventBus.emit('logout');

        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);


export const itemKeys = {
  SERIAL_NUMBER: 'serialNumber',
  USER_NAME: 'userName',
  ACCESSORY_NAME: 'accessoryName'
}

export const getDisplayValue = (item, raw=false) => {
  let attr;
  if (item.hasOwnProperty(itemKeys.SERIAL_NUMBER)) {
    attr = itemKeys.SERIAL_NUMBER;
  } else if (item.hasOwnProperty(itemKeys.USER_NAME)) {
    attr = itemKeys.USER_NAME;
  } else if (item.hasOwnProperty(itemKeys.ACCESSORY_NAME)) {
    attr = itemKeys.ACCESSORY_NAME;
  } else {
    return '';
  }

  if (raw) return attr;
  return item[attr];
};

// export const API_URL = `${process.env.REACT_APP_API_BASE_URL}`;
// console.log(API_URL);

// const c1 = 'rgb(255, 99, 132)'
// const c2 = 'rgb(54, 162, 235)'
// const c3 = 'rgb(255, 205, 86)'
// const c4 = 'rgb(75, 192, 192)'
// const c5 = 'rgb(153, 102, 255)'
// const c6 = 'rgb(255, 159, 64)'
// const c7 = 'rgb(0, 128, 128)'
// const c8 = 'rgb(255, 51, 153)'
// const c9 = 'rgb(102, 102, 0)'
// const c10 = 'rgb(128, 0, 128)'
// export const BACKGROUND_COLORS = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10];

const baseColors = ['#FF6384', '#19C4A6', '#36A2EB', '#FFA53F', '#FFF58F', '#B582D3']

const numberOfAdditionalColors = 5;
export const COLORSCALE = chroma.scale(baseColors).colors(numberOfAdditionalColors);
