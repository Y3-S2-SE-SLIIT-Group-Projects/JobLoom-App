import api from './api';

export const aiApi = {
  analyzeSkillGap: ({ jobId, cvId }) => api.post('/ai/analyze-skill-gap', { jobId, cvId }),
};
