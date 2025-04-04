import { FormType } from '../context/ModalProvider';
import { API_URL } from '../config';
import { api } from '../config';
import qs from 'qs';
import { AssetStatus } from '../components/assets/utils/AssetStatus';

class LoanService {
    constructor(api) {
        this.axios = api;
        this.URL = `${API_URL}/forms`
    }

    defaultFilters = {
        "status": AssetStatus.getAllValues(),
        "serialNumber": '',
        "bookmarked": false,
    }

    fetchAstLoan = async (serialNumbers) => {
        console.log(serialNumbers);
        return await this.axios.get(`${this.URL}/loan/asset`, {
            params: {
                serialNumbers,
            }
        });
    }

    fetchUserLoan = async (userNames) => {
        return await this.axios.get(`${this.URL}/loan/user`, {
            params: {
                userNames
            }
        });
    }

    fetchAccLoan = async (accessoryNames) => {
        return await this.axios.get(`${this.URL}/loan/accessory`, {
            params: {
                accessoryNames
            }
        });
    }

    async loanItems(formData) {
        console.log('loaning asset');
        console.log(formData);
        // downloadFormData(formData);
        return await this.axios.post(`${this.URL}/loan`, formData);
    }

    async fetchAstReturn(serialNumbers) {
        console.log(serialNumbers);
        return await this.axios.get(`${this.URL}/return/asset`, {
            params: {
                serialNumbers,
            }
        });
    }

    fetchUserReturn = async (userName) => {
        return await this.axios.get(`${this.URL}/return/user`, {
            params: {
                userName
            }
        });
    }

    fetchAccReturn = async (accessoryName) => {
        return await this.axios.get(`${this.URL}/return/accessory`, {
            params: {
                accessoryName
            }
        });
    }

    fetchReturns = async (loanIds) => {
        console.log(loanIds);
        return await this.axios.get(`${this.URL}/return`, {
            params: {
                loanIds,
            }
        });
    }

    async returnItems(formData) {
        console.log(formData);
        return await this.axios.post(`${this.URL}/return`, formData);
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
  

const loanService = new LoanService(api);
export default loanService;
