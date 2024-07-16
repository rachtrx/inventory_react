import { API_URL } from '../config';
import { axiosInstance } from '../context/AuthProvider';

class UserService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    async loadUser(userId) {
        return await this.axios.get(`${API_URL}/users/${userId}`);
    }

    async loadUsers() {
        return await this.axios.get(`${API_URL}/users`);
    }

    async loadUserFilters() {
        return await this.axios.get(`${API_URL}/users/filters`);
    }

    static loadFullUserDetails(assetId) {
        return this.axios.get(`${API_URL}/users/complete/${assetId}`);
    }

    
    static bookmarkUser(assetId) {
        return this.axios.post(`${API_URL}/users/bookmark/${assetId}`);
    }

    static loadAllUsers() {
        return this.axios.get(`${API_URL}/users/`);
    }
}

const userService = new UserService(axiosInstance);
export default userService;