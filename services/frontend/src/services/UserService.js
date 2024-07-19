import { API_URL } from '../config';
import { axiosInstance } from '../config';

class UserService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    async loadUser(id) {
        return await this.axios.get(`${API_URL}/users/${id}`);
    }

    async loadUsers() {
        return await this.axios.get(`${API_URL}/users`);
    }
    
    async bookmark(id, bookmarked) {
        return await this.axios.post(`${API_URL}/users/bookmark`, {id, bookmarked});
    }

    async loadAllUsers() {
        return await this.axios.get(`${API_URL}/users/`);
    }

    async searchUsers() {
        return await this.axios.get(`${API_URL}/users/search`);
    }
}

const userService = new UserService(axiosInstance);
export default userService;