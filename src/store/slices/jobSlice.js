import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const initialFilters = {
  category: '',
  status: '',
  search: '',
  minSalary: '',
  maxSalary: '',
  district: '',
  province: '',
  page: 1,
  limit: 20,
};

const parseErrorMessage = async response => {
  try {
    const data = await response.json();
    return data?.message || 'Request failed';
  } catch {
    return 'Request failed';
  }
};

const buildQueryParams = filters => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  return queryParams.toString();
};

const getToken = () => localStorage.getItem('token');

const getAuthHeaders = (includeContentType = false) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('jobloom_token');

  const headers = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const fetchJobsThunk = createAsyncThunk(
  'jobs/fetchJobs',
  async (customFilters = {}, { getState, rejectWithValue }) => {
    try {
      const mergedFilters = { ...getState().jobs.filters, ...customFilters };
      const queryString = buildQueryParams(mergedFilters);
      const response = await fetch(`${API_URL}/jobs?${queryString}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      return {
        jobs: data?.data?.jobs || [],
        pagination: data?.data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobByIdThunk = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch job');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch job');
    }
  }
);

export const fetchRecommendedJobsThunk = createAsyncThunk(
  'jobs/fetchRecommendedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/recommendations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recommendations');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recommendations');
    }
  }
);

export const fetchMyJobsThunk = createAsyncThunk(
  'jobs/fetchMyJobs',
  async (options = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (options.includeInactive) {
        queryParams.append('includeInactive', 'true');
      }
      if (options.status) {
        queryParams.append('status', options.status);
      }

      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/employer/my-jobs?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      return data?.data?.jobs || [];
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchEmployerStatsThunk = createAsyncThunk(
  'jobs/fetchEmployerStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/employer/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch stats');
    }
  }
);

export const createJobThunk = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create job');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create job');
    }
  }
);

export const updateJobThunk = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, updates }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update job');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update job');
    }
  }
);

export const closeJobThunk = createAsyncThunk(
  'jobs/closeJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${jobId}/close`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to close job');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to close job');
    }
  }
);

export const markJobAsFilledThunk = createAsyncThunk(
  'jobs/markJobAsFilled',
  async (jobId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${jobId}/filled`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark job as filled');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to mark job as filled');
    }
  }
);

export const deleteJobThunk = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete job');
      }

      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete job');
    }
  }
);

export const generateJobDescriptionThunk = createAsyncThunk(
  'jobs/generateJobDescription',
  async (draftData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/jobs/generate-description`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(draftData),
      });

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message || 'Failed to generate job description');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to generate job description');
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
    filters: initialFilters,
    pagination: null,
  },
  reducers: {
    updateFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialFilters;
    },
    clearJobError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchJobsThunk.fulfilled, (state, action) => {
      state.jobs = action.payload.jobs;
      state.pagination = action.payload.pagination;
    });

    builder.addMatcher(
      action => action.type.startsWith('jobs/') && action.type.endsWith('/pending'),
      state => {
        state.loading = true;
        state.error = null;
      }
    );

    builder.addMatcher(
      action => action.type.startsWith('jobs/') && action.type.endsWith('/fulfilled'),
      state => {
        state.loading = false;
      }
    );

    builder.addMatcher(
      action => action.type.startsWith('jobs/') && action.type.endsWith('/rejected'),
      (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Request failed';
      }
    );
  },
});

export const { updateFilters, resetFilters, clearJobError } = jobSlice.actions;

export const selectJobs = state => state.jobs.jobs;
export const selectJobsLoading = state => state.jobs.loading;
export const selectJobsError = state => state.jobs.error;
export const selectJobFilters = state => state.jobs.filters;
export const selectJobPagination = state => state.jobs.pagination;

export default jobSlice.reducer;
