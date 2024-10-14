import { API_URL } from '../config';
import { axiosInstance } from '../config';

class AccessoryService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
        this.URL = `${API_URL}/accessories`
    }

    defaultFilters = {
        "accessoryName": []
    }

    async loadItems(filters = this.defaultFilters) {
        return await this.axios.post(`${this.URL}`, {filters});
    }

    async getItem(id) {
        return await this.axios.get(`${this.URL}/${id}`);
    }

    async getFilters(field) {
        return await this.axios.post(`${this.URL}/filters`, {field});
    }

    async loanAccessory(id, userId) {
        console.log('loaning asset');
        return await this.axios.post(`${this.URL}/loan`, [id, userId]);;
    }
    
    async returnAccessory(id) {
        return await this.axios.post(`${this.URL}/return`, id);
    }

    async addAccessories(formValues) {
        return await this.axios.post(`${this.URL}/add`, formValues);;
    }

    async searchAccessories(value) {
        return await this.axios.post(`${this.URL}/search`, { value });
    }

    async getSuggestedAccessories(id) {
        return await this.axios.post(`${this.URL}/getSuggested`, { assetId: id });
    }

    async updateVariantSuggestion(assetId, accessoryTypeId, saved) {
        return await this.axios.post(`${this.URL}/updateVariantSuggestion`, { assetId, accessoryTypeId, saved })
    }

    async updateAssetTypeSuggestion(assetId, accessoryTypeId, saved) {
        return await this.axios.post(`${this.URL}/updateAssetTypeSuggestion`, { assetId, accessoryTypeId, saved })
    }
}

const accessoryService = new AccessoryService(axiosInstance);
export default accessoryService;