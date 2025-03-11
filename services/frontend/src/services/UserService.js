import { FormType } from '../context/ModalProvider';
import { API_URL } from '../config';
import { axiosInstance } from '../config';

class UserService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    defaultFilters = {
        deptName: [],
        userName: '',
        assetCount: [0, 100],
        bookmarked: false,
        userTag: [],
    }

    async getItem(id) {
        return await this.axios.get(`${API_URL}/users/${id}`);
    }

    async getFilters(field) {
        return await this.axios.post(`${API_URL}/users/filters`, {field});
    }

    async loadItems({ filters = this.defaultFilters, sort, page=1, pageSize=30 }) {
        console.log(filters)
        return await this.axios.get(`${API_URL}/users`, {
            params: {
                filters,
                sort,
                page,
                limit: pageSize,
            }
        });
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
        // downloadFormData(data);
        return await this.axios.post(`${API_URL}/forms/add/user`, data);
    }

    async removeUser(data) {
        // downloadFormData(data);
        return await this.axios.post(`${API_URL}/forms/del/user`, data);
    }

    // Only fetched through single search
    fetchUserReturn = async (userName) => {
        return await this.axios.get(`${API_URL}/forms/return/user`, {
            params: {
                userName
            }
        });
    }

    fetchUserDel = async (userNames) => {
        return await this.axios.get(`${API_URL}/forms/del/user`, {
            params: {
                userNames
            }
        });
    }

    fetchUserLoan = async (userNames) => {
        return await this.axios.get(`${API_URL}/forms/loan/user`, {
            params: {
                userNames
            }
        });
    }

    fetchTagUser = async(userNames, tagId=null) => {
        const options = await this.axios.get(`${API_URL}/forms/tag/user`, {
            params: {
                userNames,
                tagId,
            }
        });
        return options;
    }

    fetchUntagUser = async (userNames, tagId=null) => {
        return await this.axios.get(`${API_URL}/forms/untag/user`, {
            params: {
                userNames,
                tagId,
            }
        });
    }

    async tagUser(formData) {
        // downloadFormData(formData);
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/tag/user`, formData);
    }

    async untagUser(formData) {
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/untag/user`, formData);
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