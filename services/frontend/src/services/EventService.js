import { FormType } from '../context/ModalProvider';
import { API_URL } from '../config';
import { axiosInstance } from '../config';
import qs from 'qs';

class EventService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
    }

    defaultFilters = {
        "startDate": "",
        "endDate": "",
        "eventType": [],
        "typeName": [],
        "subTypeName": [],
        "serialNumber": "",
        "deptName": [],
        "userName": "",
        "assetTag": [],
        "userTag": [],
        "admin": []
    }

    async getFilters(field) {
        return await this.axios.post(`${API_URL}/events/filters`, {field});
    }

    async loadItems(filters = this.defaultFilters) {
        console.log(API_URL)
        return await this.axios.get(`${API_URL}/events`, {params: { filters }});
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
  

const eventService = new EventService(axiosInstance);
export default eventService;
