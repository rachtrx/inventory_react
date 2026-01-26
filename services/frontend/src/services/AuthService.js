import { API_URL, api } from '../config';

class AuthService {
  constructor(api) {
    this.axios = api;
  }

  async logout() {
    return await this.axios.post(`${API_URL}/auth/logout`)
  }

  async checkAuth() {
    return await this.axios.get(`${API_URL}/auth/checkAuth`) //, { headers: { 'Skip-Interceptor': true } }
  }

  async submitPassword(password) {
    return await this.axios.post(`${API_URL}/auth/chgpw`, { password })
  }

  // const register = useCallback(async (adminName, email, password) => {
  //   try {
  //     await api.post('/auth/register', { adminName, email, password });
  //   } catch (error) {
  //     console.error('Registration failed:', error.response ? error.response.data : error);
  //     throw error;
  //   }
  // }, []);

  // async login(email, password) {
  //   return await this.axios.post(`${API_URL}/auth/login`, { email, password })
  // }
}

const authService = new AuthService(api);
export default authService;