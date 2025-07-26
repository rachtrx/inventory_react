import { API_URL } from '../config';
import { api } from '../config';

class AccessoryService {
    constructor(api) {
        this.axios = api;
        this.URL = `${API_URL}/accessories`
    }

    defaultFilters = {
        "accessoryName": ""
    }

    async downloadExcel({ filters = this.defaultFilters, sort }) {
        return await this.axios.get(`${this.URL}/excel`, {
          params: { filters, sort },
          responseType: 'blob',
        });
    }

    async loadItems({ filters = this.defaultFilters, sort, page=1, pageSize=30 }) {
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

    async getLoanDetails(id) {
        return await this.axios.get(`${this.URL}/loans/${id}`);
    }

    async getReservationDetails(id) {
        return await this.axios.get(`${this.URL}/reservations/${id}`);
    }

    async getItem(id) {
        return await this.axios.get(`${this.URL}/${id}`);
    }

    async getFilters(field) {
        return await this.axios.post(`${this.URL}/filters`, {field});
    }
    async getAllFilters() {
        return this;
    }

    async loanAccessory(id, userId) {
        console.log('loaning asset');
        return await this.axios.post(`${this.URL}/loan`, [id, userId]);;
    }
    
    async returnAccessory(id) {
        return await this.axios.post(`${this.URL}/return`, id);
    }

    async addAccessories(formValues) {
        return await this.axios.post(`${this.URL}/addTxn`, formValues);;
    }

    async createAccessory(accessoryName) {
        return await this.axios.post(`${this.URL}/add`, { accessoryName });;
    }
}

const accessoryService = new AccessoryService(api);
export default accessoryService;