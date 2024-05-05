import { API_URL } from '../config';

export default class AssetService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    async loadAssets(filters) {
        return await this.axios.post(`${API_URL}/assets/`, filters);
    }

    async loadAssetFilters() {
        return await this.axios.get(`${API_URL}/assets/filters`);
    }

    loadFullDeviceDetails(assetId) {
        return this.axios.get(`${API_URL}/assets/${assetId}`);
    }

    bookmarkAsset(assetId) {
        return this.axios.post(`${API_URL}/assets/bookmark/${assetId}`);
    }
}