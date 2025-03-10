import { FormType } from '../context/ModalProvider';
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
        "bookmarked": false,
        "assetTag": [],
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
        console.log(API_URL)
        return await this.axios.post(`${API_URL}/assets`, {filters});
    }

    async updateItem(id, field, newValue) {
        return await this.axios.patch(`${API_URL}/assets/update`, {id, field, newValue});
    }

    async createNewType(typeName) {
        console.log(typeName);
        return await this.axios.post(`${API_URL}/forms/add/type`, { typeName });
    }

    async createNewSubType(subTypeName, typeId) {
        console.log(subTypeName);
        return await this.axios.post(`${API_URL}/forms/add/subType`, { subTypeName, typeId });
    }

    async createNewVendor(vendorName) {
        console.log(vendorName);
        return await this.axios.post(`${API_URL}/forms/add/vendor`, { vendorName });
    }

    async loanAsset(formData) {
        console.log('loaning asset');
        console.log(formData);
        // downloadFormData(formData);
        return await this.axios.post(`${API_URL}/forms/loan`, formData);
    }

    async fetchAstReturn(serialNumbers) {
        console.log(serialNumbers);
        return await this.axios.get(`${API_URL}/forms/return/asset`, {
            params: {
                serialNumbers,
            }
        });
    }

    async fetchReturns(loanIds) {
        console.log(loanIds);
        return await this.axios.get(`${API_URL}/forms/return`, {
            params: {
                loanIds,
            }
        });
    }

    async fetchAstLoan(serialNumbers) {
        console.log(serialNumbers);
        return await this.axios.get(`${API_URL}/forms/loan/asset`, {
            params: {
                serialNumbers,
            }
        });
    }

    async fetchAstDel(serialNumbers) {
        console.log(serialNumbers);
        return await this.axios.get(`${API_URL}/forms/del/asset`, {
            params: {
                serialNumbers,
            }
        });
    }
    
    async returnAsset(formData) {
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/return`, formData);
    }

    async addAsset(formData) {
        // downloadFormData(formData);
        return await this.axios.post(`${API_URL}/forms/add/asset`, formData);;
    }

    async delAsset(formData) {
        // downloadFormData(formData);
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/del/asset`, formData);
    }

    fetchTagAsset = async(serialNumbers, tagId=null) => {
        return await this.axios.get(`${API_URL}/forms/tag/asset`, {
            params: {
                serialNumbers,
                tagId,
            }
        });
    }

    fetchUntagAsset = async (serialNumbers, tagId=null) => {
        return await this.axios.get(`${API_URL}/forms/untag/asset`, {
            params: {
                serialNumbers,
                tagId,
            }
        });
    }

    async tagAsset(formData) {
        // downloadFormData(formData);
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/tag/asset`, formData);
    }

    async untagAsset(formData) {
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/untag/asset`, formData);
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
