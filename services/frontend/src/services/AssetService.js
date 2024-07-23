import { API_URL } from '../config';
import { axiosInstance } from '../config';

class AssetService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    async getAsset(id) {
        return await this.axios.get(`${API_URL}/assets/${id}`);
    }

    async loadAssets() {
        return await this.axios.get(`${API_URL}/assets`);
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