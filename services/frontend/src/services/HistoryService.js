import { axiosInstance } from '../config';
import { API_URL } from '../config';

export default class HistoryService {

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
        "assetTag": '',
        "dept": [],
        "userName": '',
        "accessoryName": []
    }

    async loadAllEvents(filters) {
        return await this.axios.get(`${API_URL}/history`, {
            params: {
                assetIds: filters
            }
        });
    }
}