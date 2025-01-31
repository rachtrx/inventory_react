import { FormType } from '../context/ModalProvider';
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
    
    async updateItem(id, field, newValue) {
        return await this.axios.patch(`${API_URL}/users/update`, {id, field, newValue});
    }

    async searchUsers(value, formType) {

        const params = { value }

        if (formType === FormType.LOAN) {
            return await this.axios.get(`${API_URL}/users/search/loan`, {params});
        } else if (formType === FormType.DEL_USER) {
            return await this.axios.get(`${API_URL}/users/search/delete`, {params});
        } else throw new Error("Form Type not found")
    }

    async addUser(data) {
        downloadFormData(data);
        // return await this.axios.get(`${API_URL}/users/add`, data);
    }

    async removeUser(data) {
        downloadFormData(data);
        // return await this.axios.get(`${API_URL}/users/remove`, data);
    }

    async fetchUserReturn(userName) {
        return await this.axios.get(`${API_URL}/forms/return/user`, {
            params: {
                userName
            }
        });
    }
}

const downloadFormData = (formData) => {
    const data = JSON.stringify(formData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'formData.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
  

const userService = new UserService(axiosInstance);
export default userService;