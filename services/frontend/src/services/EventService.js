import { FormType } from '../context/FormProvider';
import { API_URL } from '../config';
import { api } from '../config';
import qs from 'qs';

class EventService {
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
        // "admin": [],
        "remarks": ""
    }

    async getAllFilters() {
        return await this.axios.get(`${API_URL}/events/filters/all`);
    }

    async loadItems({ filters = this.defaultFilters, sort, page, pageSize }) {
        console.log(filters)
        return await this.axios.get(`${API_URL}/events`, {
            params: {
                filters,
                sort,
                page,
                limit: pageSize,
            }
        });
    }

    async downloadExcel({ filters = this.defaultFilters, sort }) {
        return await this.axios.get(`${API_URL}/events/excel`, {
          params: { filters, sort },
          responseType: 'blob',
        });
    }

    async getSignature(loanId) {
        return await this.axios.get(`${API_URL}/events/signature/${loanId}`, {
          responseType: 'blob', // required to treat it as a binary image
        });
    }

    async updateItem(id, field, newValue) {
        return await this.axios.patch(`${API_URL}/events/update`, {id, field, newValue});
    }

    async addRemark(eventId, remark, dateTime) {
        return await this.axios.post(`${API_URL}/events/add/remark`, {eventId, remark, dateTime});
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
  

const eventService = new EventService(api);
export default eventService;
