import { api } from 'boot/axios';

export default {
  getAll() {
    return api.get('users');
  },
  create(data) {
    return api.post('users', data);
  },
  update(username, data) {
    return api.put(`users/${username}`, data);
  },
  delete(username) {
    return api.delete(`users/${username}`);
  }
};
