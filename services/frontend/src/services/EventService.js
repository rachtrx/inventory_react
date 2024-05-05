import axios from 'axios';
import { API_URL } from '../config';

export default class EventService {

    static loadAllEvents() {
        return axios.get(`${API_URL}/events`, {withCredentials: true});
    }
}