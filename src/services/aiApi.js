import api from './api';

export const aiApi = {
  analyzeSkillGap: ({ jobId, cvId, language }) =>
    api.post('/ai/analyze-skill-gap', { jobId, cvId, language }),
};
