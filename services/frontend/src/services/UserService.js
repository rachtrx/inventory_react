import axios from 'axios';
import { API_URL } from '../config';

export default class UserService {
    static loadFullUserDetails(assetId) {
        return axios.get(`${API_URL}/users/complete/${assetId}`);
    }

    
    static bookmarkUser(assetId) {
        return axios.post(`${API_URL}/users/bookmark/${assetId}`);
    }

    static loadAllUsers() {
        return axios.get(`${API_URL}/users/`);
    }
}