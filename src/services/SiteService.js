import { api } from 'boot/axios';

const SiteService = {
  getAll() {
    return api.get('sites');
  },
  getByID(id) {
    return api.get(`sites/${id}`);
  },
  create(data) {
    return api.post('sites', data);
  },
  update(id, data) {
    return api.put(`sites/${id}`, data);
  },
  delete(id) {
    return api.delete(`sites/${id}`);
  }
};

export default SiteService;
