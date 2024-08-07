import axios from 'axios';
import { API_URL } from '../config';

export default class FormService {
    static loadAssetsLoanable(id) {
        return axios.get(`${API_URL}/forms/loan/${id}`);
    }

    static loadAssetsReturnable(id) {
        return axios.get(`${API_URL}/forms/return/${id}`);
    }

    static AddAsset(data) { // device type and model
        return axios.post(`${API_URL}/forms/add/`, data);
    }

    static AddAsset(data) {
        return axios.post(`${API_URL}/forms/register/`, data);
    }

    static loanAsset(id) {
        return axios.post(`${API_URL}/forms/loan/${id}`);
    }

    static returnAsset(id) {
        return axios.post(`${API_URL}/forms/return/${id}`);
    }

    static condemnAsset(id) {
        return axios.post(`${API_URL}/forms/condemn/`, id);
    }

    static AddUser(data) { // dept and user
        return axios.post(`${API_URL}forms/AddUser/`, data);
    }

    static removeUser(id) {
        return axios.post(`${API_URL}forms/remove/`, id);
    }
}