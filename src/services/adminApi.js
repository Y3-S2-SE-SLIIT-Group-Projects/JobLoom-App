import api from './api';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data.data;
};

export const updateAdminUser = async (userId, data) => {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data.data;
};

export const getAdminJobs = async (params = {}) => {
  const response = await api.get('/admin/jobs', { params });
  return response.data.data;
};

export const updateAdminJob = async (jobId, data) => {
  const response = await api.put(`/admin/jobs/${jobId}`, data);
  return response.data.data;
};

export default {
  getAdminStats,
  getAdminUsers,
  updateAdminUser,
  getAdminJobs,
  updateAdminJob,
};
