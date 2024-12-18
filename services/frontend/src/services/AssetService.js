import { API_URL } from '../config';
import { axiosInstance } from '../config';
import qs from 'qs';

class AssetService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    defaultFilters = {
        "typeName": [],
        "subTypeName": [],
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

    async getSubTypeFilters(typeIds) {
        return await this.axios.post(`${API_URL}/assets/filters/subTypes`, {typeIds});
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
        // downloadFormData(formData);
        return await this.axios.post(`${API_URL}/forms/loan`, formData);
    }

    async fetchReturn(assetIds) {
        console.log(assetIds);
        return await this.axios.get(`${API_URL}/forms/return`, {
            params: {
                assetIds: assetIds
            }
        });
    }
    
    async returnAsset(formData) {
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/return`, formData);
    }

    async addAsset(formData) {
        // downloadFormData(formData);
        return await this.axios.post(`${API_URL}/assets/add`, formData);;
    }

    async delAsset(formData) {
        downloadFormData(formData);
        // return await this.axios.delete(`${API_URL}/assets/condemn`, formData);
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