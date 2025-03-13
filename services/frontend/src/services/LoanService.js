import { FormType } from '../context/ModalProvider';
import { API_URL } from '../config';
import { axiosInstance } from '../config';
import qs from 'qs';
import { AssetStatus } from '../components/assets/constants/AssetStatus';

class LoanService {
    constructor(axiosInstance) {
        this.axios = axiosInstance;
        this.URL = `${API_URL}/assets`
    }

    defaultFilters = {
        "status": AssetStatus.getAllValues(),
        "serialNumber": '',
        "bookmarked": false,
    }

    fetchAstLoan = async (serialNumbers) => {
        console.log(serialNumbers);
        return await this.axios.get(`${API_URL}/forms/loan/asset`, {
            params: {
                serialNumbers,
            }
        });
    }

    fetchUserLoan = async (userNames) => {
        return await this.axios.get(`${API_URL}/forms/loan/user`, {
            params: {
                userNames
            }
        });
    }

    fetchAccLoan = async (accessoryNames) => {
        return await this.axios.get(`${API_URL}/forms/loan/accessory`, {
            params: {
                accessoryNames
            }
        });
    }

    async loanItems(formData) {
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

    fetchUserReturn = async (userName) => {
        return await this.axios.get(`${API_URL}/forms/return/user`, {
            params: {
                userName
            }
        });
    }

    fetchAccReturn = async (accessoryName) => {
        return await this.axios.get(`${API_URL}/forms/return/accessory`, {
            params: {
                accessoryName
            }
        });
    }

    fetchReturns = async (loanIds) => {
        console.log(loanIds);
        return await this.axios.get(`${API_URL}/forms/return`, {
            params: {
                loanIds,
            }
        });
    }

    async returnItems(formData) {
        console.log(formData);
        return await this.axios.post(`${API_URL}/forms/return`, formData);
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
  

const loanService = new LoanService(axiosInstance);
export default loanService;
