import { api } from 'boot/axios';

export default {
  getAll() {
    return api.get('stations');
  },
  create(data) {
    return api.post('stations', data);
  },
  update(id, data) {
    return api.put(`stations/${id}`, data);
  },
  delete(id) {
    return api.delete(`stations/${id}`);
  }
};
