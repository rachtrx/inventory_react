import { axiosInstance } from '../config';
import { AUTH_URL } from "../config";
import { graphConfig } from '../authConfig';
import axios from 'axios';

class AuthService {
  constructor(axiosInstance) {
    this.axios = axiosInstance;
  }

  async login(email, password) {
    return await this.axios.post(AUTH_URL + "/login", { email, password })
  }

  async loginSSO(profile) {
    return await this.axios.post(AUTH_URL + "/login-sso", { profile })
  }

  /**
 * Attaches a given access token to a MS Graph API call. Returns information about the user
 * @param accessToken 
 */
  async callMsGraph(accessToken) {
    const config = {
        method: 'get',
        url: graphConfig.graphMeEndpoint,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

    console.log(process.env.REACT_APP_SSO_GRAPH_API_ENDPOINT);

    try {
        const response = await axios(config);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error calling MS Graph:', error);
        throw error; 
    }
  }

  async logout() {
    return await this.axios.post(AUTH_URL + "/logout")
  }

  async checkAuth() {
    return await this.axios.get(AUTH_URL + '/checkAuth', { headers: { 'Skip-Interceptor': true } })
  }

  async submitPassword(password) {
    return await this.axios.post(AUTH_URL + '/chgpw', { password })
  }

  // const register = useCallback(async (adminName, email, password) => {
  //   try {
  //     await axiosInstance.post('/auth/register', { adminName, email, password });
  //   } catch (error) {
  //     console.error('Registration failed:', error.response ? error.response.data : error);
  //     throw error;
  //   }
  // }, []);
}

const authService = new AuthService(axiosInstance);
export default authService;