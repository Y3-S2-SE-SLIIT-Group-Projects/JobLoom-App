import api from './api';

/**
 * Application API Service
 * Thin layer — no business logic, just data transport.
 */
export const applicationApi = {
  // ── Job Seeker ──────────────────────────────────────────────
  apply: data => api.post('/applications', data),
  getMyApplications: params => api.get('/applications/my-applications', { params }),
  getApplicationById: id => api.get(`/applications/${id}`),
  withdraw: (id, data) => api.patch(`/applications/${id}/withdraw`, data),
  updateNotes: (id, data) => api.patch(`/applications/${id}/notes`, data),

  // ── Employer ────────────────────────────────────────────────
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getJobStats: jobId => api.get(`/applications/job/${jobId}/stats`),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.patch(`/applications/${id}/interview`, data),
  cancelInterview: id => api.delete(`/applications/${id}/interview`),

  // ── Interview (employer + seeker — join context for Jitsi) ──
  getInterviewJoinContext: id => api.get(`/applications/${id}/interview-join-context`),
};
