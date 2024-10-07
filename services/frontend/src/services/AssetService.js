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

    async updateItem(id, field, newValue) {
        return await this.axios.patch(`${API_URL}/assets/update`, {id, field, newValue});
    }

    async loanAsset(formData) {
        console.log('loaning asset');
        console.log(formData);
        downloadFormData(formData);
        return await this.axios.post(`${API_URL}/forms/loan`, formData);;
    }

    async fetchReturn(assetId) {
        return await this.axios.get(`${API_URL}/forms/return`, {
            params: {
                id: assetId
            }
        });
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

    async searchAssets(value, formType, mode) {
        return await this.axios.post(`${API_URL}/assets/search`, { value, formType, mode });
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
  

const assetService = new AssetService(axiosInstance);
export default assetService;