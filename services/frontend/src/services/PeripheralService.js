import { API_URL } from '../config';
import { axiosInstance } from '../config';

class PeripheralService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
        this.URL = `${API_URL}/peripherals`
    }

    defaultFilters = {
        "peripheralName": []
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

    async loanPeripheral(id, userId) {
        console.log('loaning asset');
        return await this.axios.post(`${this.URL}/loan`, [id, userId]);;
    }
    
    async returnPeripheral(id) {
        return await this.axios.post(`${this.URL}/return`, id);
    }

    async addPeripherals(formValues) {
        return await this.axios.post(`${this.URL}/add`, formValues);;
    }

    async searchPeripherals(value) {
        return await this.axios.post(`${this.URL}/search`, { value });
    }

    async getSuggestedPeripherals(id) {
        return await this.axios.post(`${this.URL}/getSuggested`, { assetId: id });
    }

    async updateVariantSuggestion(assetId, peripheralId, saved) {
        return await this.axios.post(`${this.URL}/updateVariantSuggestion`, { assetId, peripheralId, saved })
    }

    async updateAssetTypeSuggestion(assetId, peripheralId, saved) {
        return await this.axios.post(`${this.URL}/updateAssetTypeSuggestion`, { assetId, peripheralId, saved })
    }
}

const peripheralService = new PeripheralService(axiosInstance);
export default peripheralService;