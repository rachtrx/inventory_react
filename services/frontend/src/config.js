import chroma from "chroma-js";
import axios from 'axios';

export const TIMEOUT_SEC = 300;
export const PREVIEW_TIMEOUT_BLUR = 100;
export const RES_PER_PAGE = 30;
export const API_URL = 'http://127.0.0.1:3001/api';

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

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

export const eventToStatus = function(event) {
    let status;
  
    switch(event) {
  
      case 'registered':
        status = 'REGISTERED'
        break;
  
      case 'loaned':
        status = 'ON LOAN'
        break;
  
      case 'available':
        status = 'AVAILABLE'
        break;
  
      case 'condemned':
        status = 'CONDEMNED'
        break;

      default:
        break
    }
  
    return status;
  }