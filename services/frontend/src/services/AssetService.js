import { API_URL } from '../config';
import { axiosInstance } from '../context/AuthProvider';

class AssetService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    async loadAsset(assetId) {
        return await this.axios.get(`${API_URL}/assets/${assetId}`);
    }

    async loadAssets() {
        return await this.axios.get(`${API_URL}/assets`);
    }

    async loadAssetFilters() {
        return await this.axios.get(`${API_URL}/assets/filters`);
    }

    async loadFullDeviceDetails(assetId) {
        return await this.axios.get(`${API_URL}/assets/${assetId}`);
    }

    async bookmarkAsset(assetId) {
        return await this.axios.post(`${API_URL}/assets/bookmark/${assetId}`);
    }

    async condemnAsset(assetIds) {
        return await this.axios.delete(`${API_URL}/assets/condemn`, assetIds);;
    }

    async addAsset(asset) {
        return await this.axios.delete(`${API_URL}/assets/add`, asset);;
    }

    async loanAsset(assetId, userId) {
        return await this.axios.delete(`${API_URL}/assets/loan`, [assetId, userId]);;
    }

    async returnAsset(assetId) {
        return await this.axios.delete(`${API_URL}/assets/return`, assetId);;
    }
}

const assetService = new AssetService(axiosInstance);
export default assetService;