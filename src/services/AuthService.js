import { api } from 'boot/axios';

export default {
  login(username, password) {
    return api.post('login', { username, password });
  },
  getMe() {
    return api.get('me');
  },
  validateToken() {
    return api.get('validate');
  }
};
