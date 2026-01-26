import { FormType } from '../context/FormProvider';
import { API_URL } from '../config';
import { api } from '../config';
import qs from 'qs';
import { AssetStatus } from '../components/assets/utils/AssetStatus';

class AssetService {
    constructor(api) {
        this.axios = api;
        this.URL = `${API_URL}/assets`
    }

    defaultFilters = {
        "status": AssetStatus.getAllValues(),
        "serialNumber": '',
        "bookmarked": false,
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

    getFilters = async (field) => {
        return await this.axios.post(`${this.URL}/filters`, {field});
    }

    async getAllFilters() {
        return await this.axios.get(`${this.URL}/filters/all`);
    }

    async getSubTypeFilters(typeIds) {
        return await this.axios.post(`${this.URL}/filters/subTypes`, {typeIds});
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
        return await this.axios.patch(`${this.URL}/update`, body );
    }

    createNewType = async (typeName) => {
        return await this.axios.post(`${this.URL}/add/type`, { typeName });
    }

    async createNewSubType(subTypeName, typeId) {
        return await this.axios.post(`${this.URL}/add/subType`, { subTypeName, typeId });
    }

    async createNewVendor(vendorName) {
        return await this.axios.post(`${this.URL}/add/vendor`, { vendorName });
    }

    async createNewTag(tagName) {
        console.log(tagName);
        return await this.axios.post(`${this.URL}/add/tag`, { tagName });
    }

    async addAsset(formData) {
        // downloadFormData(formData);
        return await this.axios.post(`${this.URL}/add/asset`, formData);;
    }

    // TODO
    async fetchAstDel(serialNumbers) {
        console.log(serialNumbers);
        return await this.axios.post(`${this.URL}/del/asset/lookup`, {
            serialNumbers,
        });
    }

    // TODO
    async fetchAstDelById(assetIds) {
        console.log(assetIds);
        return await this.axios.post(`${this.URL}/del/asset/lookup`, {
            assetIds,
        });
    }

    async delAsset(formData) {
        // downloadFormData(formData);
        console.log(formData);
        return await this.axios.post(`${this.URL}/del/asset`, formData);
    }

    // TODO
    fetchTagAsset = async(serialNumbers, tagId=null) => {
        return await this.axios.post(`${this.URL}/tag/asset/lookup`, {
            serialNumbers,
            tagId,
        });
    }

    // TODO
    fetchTagAssetById = async(assetIds, tagId=null) => {
        return await this.axios.post(`${this.URL}/tag/asset/lookup`, {
            assetIds,
            tagId,
        });
    }
    
    tagAsset = async (formData) => {
        // downloadFormData(formData);
        console.log(formData);
        return await this.axios.post(`${this.URL}/tag/asset`, formData);
    }

    // TODO
    fetchUntagAsset = async (serialNumbers, tagId=null) => {
        return await this.axios.post(`${this.URL}/untag/asset/lookup`, {
            serialNumbers,
            tagId,
        });
    }

    // TODO
    fetchUntagAssetById = async (assetIds, tagId=null) => {
        return await this.axios.post(`${this.URL}/untag/asset/lookup`, {
            assetIds,
            tagId,
        });
    }

    untagAsset = async (formData) => {
        console.log(formData);
        return await this.axios.post(`${this.URL}/untag/asset`, formData);
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
  

const assetService = new AssetService(api);
export default assetService;
