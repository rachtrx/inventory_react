import { FormType } from '../context/FormProvider';
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
        return this.axios.post(`${this.URL}/loan/asset/lookup`, {
            serialNumbers,
        });
    };

    fetchAstLoanById = async (assetIds) => {
        return this.axios.post(`${this.URL}/loan/asset/lookup`, {
            assetIds,
        });
    };

    fetchSuggestedAccessories = async (astSTypeId) => {
        return await this.axios.get(`${this.URL}/loan/asset/${astSTypeId}`, {
            params: {
                astSTypeId,
            }
        });
    }

    fetchUserLoan = async (userNames) => {
        return this.axios.post(`${this.URL}/loan/user/lookup`, {
            userNames,
        });
    }

    fetchUserLoanById = async (userIds) => {
        return this.axios.post(`${this.URL}/loan/user/lookup`, {
            userIds,
        });
    }

    fetchAccLoan = async () => {
        return await this.axios.get(`${this.URL}/loan/accessory`);
    }

    async loanItems(formData) {
        console.log('loaning asset');
        console.log(formData);
        // downloadFormData(formData);
        return await this.axios.post(`${this.URL}/loan`, formData);
    }

    async fetchAstReturn(serialNumbers) {
        return this.axios.post(`${this.URL}/return/asset/lookup`, {
            serialNumbers,
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
        return await this.axios.get(`${this.URL}/return/accessory/lookup`, {
            params: {
                accessoryName
            }
        });
    }

    fetchReturns = async (loanIds) => {
        return this.axios.post(`${this.URL}/return/lookup`, {
            loanIds,
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
