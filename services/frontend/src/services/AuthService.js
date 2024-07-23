import { axiosInstance } from '../config';
import { API_URL } from "../config";

class AuthService {
  constructor(axiosInstance) {
    this.axios = axiosInstance;
  }

  async login(email, password) {
    return await this.axios.post(API_URL + "/auth/login", { email, password })
  }

  async logout() {
    return await this.axios.post(API_URL + "/auth/logout")
  }

  async checkAuth() {
    return await this.axios.get('auth/checkAuth', { headers: { 'Skip-Interceptor': true } })
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