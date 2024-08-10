import { API_URL } from '../config';
import { axiosInstance } from '../config';

class AssetService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    defaultFilters = {
        "assetType": [],
        "variantName": [],
        "vendor": [],
        "status": [],
        "location": [],
        "age": [],
        "serialNumber": '',
        "assetTag": ''
    }

    async getItem(id) {
        return await this.axios.get(`${API_URL}/assets/${id}`);
    }

    async getFilters(field) {
        return await this.axios.post(`${API_URL}/assets/filters`, {field});
    }

    async loadItems(filters = this.defaultFilters) {
        return await this.axios.post(`${API_URL}/assets`, {filters});
    }

    async bookmark(id, bookmarked) {
        return await this.axios.post(`${API_URL}/assets/bookmark`, {id, bookmarked});
    }

    async loanAsset(id, userId) {
        console.log('loaning asset');
        return await this.axios.post(`${API_URL}/assets/loan`, [id, userId]);;
    }
    
    async returnAsset(id) {
        return await this.axios.post(`${API_URL}/assets/return`, id);
    }

    async addAsset(asset) {
        return await this.axios.post(`${API_URL}/assets/add`, asset);;
    }

    async condemnAsset(assetIds) {
        return await this.axios.delete(`${API_URL}/assets/condemn`, assetIds);;
    }

    async searchAssets(value, formType) {
        return await this.axios.post(`${API_URL}/assets/search`, { value, formType });
    }
}

const assetService = new AssetService(axiosInstance);
export default assetService;