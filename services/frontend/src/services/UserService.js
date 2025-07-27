import { FormType } from '../context/FormProvider';
import { API_URL } from '../config';
import { api } from '../config';

class UserService {
    constructor(api) {
        this.axios = api;
        this.URL = `${API_URL}/users`
    }

    defaultFilters = {
        userName: '',
        bookmarked: false,
    }

    async downloadExcel({ filters = this.defaultFilters, sort }) {
        return await this.axios.get(`${this.URL}/excel`, {
          params: { filters, sort },
          responseType: 'blob',
        });
    }

    async getItem(id) {
        return await this.axios.get(`${this.URL}/${id}`);
    }

    async getFilters(field) {
        return await this.axios.post(`${this.URL}/filters`, {field});
    }

    async getAllFilters() {
        return await this.axios.get(`${this.URL}/filters/all`);
    }

    async loadItems({ filters = this.defaultFilters, sort, page, pageSize }) {
        console.log(filters)
        return await this.axios.get(`${this.URL}`, {
            params: {
                filters,
                sort,
                page,
                limit: pageSize,
            }
        });
    }
    
    async updateItem(body) {
        return await this.axios.patch(`${this.URL}/update`, body);
    }

    async searchUsers(value, formType) {

        const params = { value }

        if (formType === FormType.LOAN) {
            return await this.axios.get(`${this.URL}/search/loan`, {params});
        } else if (formType === FormType.DEL_USER) {
            return await this.axios.get(`${this.URL}/search/delete`, {params});
        } else throw new Error("Form Type not found")
    }

    async addUser(data) {
        // downloadFormData(data);
        return await this.axios.post(`${this.URL}/add/user`, data);
    }

    async delUser(data) {
        // downloadFormData(data);
        return await this.axios.post(`${this.URL}/del/user`, data);
    }

    // Only fetched through single search
    

    fetchUserDel = async (userNames) => {
        return await this.axios.get(`${this.URL}/del/user`, {
            params: {
                userNames
            }
        });
    }

    fetchUserDelById = async (userIds) => {
        return await this.axios.get(`${this.URL}/del/user`, {
            params: {
                userIds
            }
        });
    }
    

    fetchTagUser = async(userNames, tagId=null) => {
        const options = await this.axios.get(`${this.URL}/tag/user`, {
            params: {
                userNames,
                tagId,
            }
        });
        return options;
    }

    fetchTagUserById = async(userIds, tagId=null) => {
        const options = await this.axios.get(`${this.URL}/tag/user`, {
            params: {
                userIds,
                tagId,
            }
        });
        return options;
    }

    fetchUntagUser = async (userNames, tagId=null) => {
        return await this.axios.get(`${this.URL}/untag/user`, {
            params: {
                userNames,
                tagId,
            }
        });
    }

    fetchUntagUserById = async (userIds, tagId=null) => {
        return await this.axios.get(`${this.URL}/untag/user`, {
            params: {
                userIds,
                tagId,
            }
        });
    }

    async tagUser(formData) {
        // downloadFormData(formData);
        console.log(formData);
        return await this.axios.post(`${this.URL}/tag/user`, formData);
    }

    async untagUser(formData) {
        console.log(formData);
        return await this.axios.post(`${this.URL}/untag/user`, formData);
    }

    async createNewTag(tagName) {
        console.log(tagName);
        return await this.axios.post(`${this.URL}/add/tag`, { tagName });
    }

    async createNewDept(deptName) {
        console.log(deptName);
        return await this.axios.post(`${this.URL}/add/dept`, { deptName });
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
  

const userService = new UserService(api);
export default userService;