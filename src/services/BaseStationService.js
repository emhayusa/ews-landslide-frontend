import { api } from 'boot/axios';

const BaseStationService = {
  getAll() {
    return api.get('base-stations');
  },
  getByID(id) {
    return api.get(`base-stations/${id}`);
  },
  create(data) {
    return api.post('base-stations', data);
  },
  update(id, data) {
    return api.put(`base-stations/${id}`, data);
  },
  delete(id) {
    return api.delete(`base-stations/${id}`);
  }
};

export default BaseStationService;
