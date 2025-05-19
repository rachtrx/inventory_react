import { FormType } from '../context/ModalProvider';
import { API_URL } from '../config';
import { api } from '../config';
import qs from 'qs';

class ReminderService {
    constructor(api) {
        this.axios = api;
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

    async getAllFilters() {
        return await this.axios.get(`${API_URL}/reminders/filters/all`);
    }

    async loadItems({ filters = this.defaultFilters, sort, page=1, pageSize=30 }) {
        console.log(filters)
        return await this.axios.get(`${API_URL}/reminders`, {
            params: {
                filters,
                sort,
                page,
                limit: pageSize,
            }
        });
    }

    // async downloadExcel({ filters = this.defaultFilters, sort }) {
    //     return await this.axios.get(`${API_URL}/reminders/excel`, {
    //       params: { filters, sort },
    //       responseType: 'blob',
    //     });
    // }

    async extendReturnDate(formData) {
        console.log(formData);
        return await this.axios.patch(`${API_URL}/reminders/update`, formData);
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
