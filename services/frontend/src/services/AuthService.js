import axios from "axios";

import { API_URL } from "../config";

export default class AuthService {
  static async login(email, password) {
    try {
        console.log(API_URL + "/auth/login")
        await axios.post(API_URL + "/auth/login", { email, password })
    } catch(err) {
      console.log(err);
      throw err;
    }
  }

  static async logout() {
    try {
      await axios.post(API_URL + "/auth/logout", {}, { withCredentials: true })
    } catch(err) {
      console.log(err);
      throw err;
    }
  }

  static async checkAuthStatus() {
    try {    
      const response = await axios.get(API_URL + "/auth/check-auth", { withCredentials: true })
      return response
    } catch(err) {
      console.log(err);
      throw err;
    }
  }
}
