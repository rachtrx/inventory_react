import { FormType } from '../context/ModalProvider';
import { API_URL } from '../config';
import { api } from '../config';
import qs from 'qs';

class ReminderService {
    constructor(api) {
        this.axios = api;
        this.URL = `${API_URL}/reminders`
    }

    defaultFilters = {
        "startDate": "",
        "endDate": "",
        // "eventType": [],
        // "typeName": [],
        // "subTypeName": [],
        "serialNumber": "",
        // "deptName": [],
        "userName": "",
        // "assetTag": [],
        // "userTag": [],
        // "admin": []
    }

    async downloadExcel({ filters = this.defaultFilters, sort }) {
        return await this.axios.get(`${this.URL}/excel`, {
          params: { filters, sort },
          responseType: 'blob',
        });
    }

    async getAllFilters() {
        return await this.axios.get(`${this.URL}/filters/all`);
    }

    async loadItems({ filters = this.defaultFilters, sort, page=1, pageSize=30 }) {
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

    // async downloadExcel({ filters = this.defaultFilters, sort }) {
    //     return await this.axios.get(`${this.URL}/excel`, {
    //       params: { filters, sort },
    //       responseType: 'blob',
    //     });
    // }

    async extendReturnDate(formData) {
        console.log(formData);
        return await this.axios.patch(`${this.URL}/update`, formData);
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
  

const reminderService = new ReminderService(api);
export default reminderService;
