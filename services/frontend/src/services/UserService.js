import { API_URL } from '../config';
import { axiosInstance } from '../config';

class UserService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    defaultFilters = {
        dept: [],
        userName: '',
        assetCount: [],
    }

    async getItem(id) {
        return await this.axios.get(`${API_URL}/users/${id}`);
    }

    async getFilters(field) {
        return await this.axios.post(`${API_URL}/users/filters`, {field});
    }

    async loadItems(filters = this.defaultFilters) {
        return await this.axios.post(`${API_URL}/users`, {filters});
    }
    
    async update(id, field, newValue) {
        return await this.axios.patch(`${API_URL}/users/update`, {id, field, newValue});
    }

    async searchUsers(value, formType) {
        return await this.axios.post(`${API_URL}/users/search`, {value, formType});
    }

    async addUser(data) {
        return await this.axios.get(`${API_URL}/users/add`, data);
    }

    async removeUser(id) {
        return await this.axios.get(`${API_URL}/users/remove`, id);
    }
}

const userService = new UserService(axiosInstance);
export default userService;