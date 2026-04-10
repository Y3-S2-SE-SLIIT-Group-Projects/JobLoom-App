import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { applicationApi } from '../../services/applicationApi';

// ─── Async Thunks ──────────────────────────────────────────────────────────────

export const submitApplication = createAsyncThunk(
  'applications/submit',
  async (data, { rejectWithValue }) => {
    try {
      const { data: res } = await applicationApi.apply(data);
      return res.data?.application ?? res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadMyApplications = createAsyncThunk(
  'applications/loadMine',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await applicationApi.getMyApplications(params);
      return data.data; // { applications, pagination }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadApplicationById = createAsyncThunk(
  'applications/loadOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await applicationApi.getApplicationById(id);
      return data.data?.application ?? data.data ?? data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const withdrawApplication = createAsyncThunk(
  'applications/withdraw',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await applicationApi.withdraw(id, data);
      return { id, withdrawalReason: data?.withdrawalReason };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateApplicationNotes = createAsyncThunk(
  'applications/updateNotes',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await applicationApi.updateNotes(id, data);
      return res.data?.application ?? res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Employer thunks ─────────────────────────────────────────────────────────────

export const loadJobApplications = createAsyncThunk(
  'applications/loadForJob',
  async ({ jobId, params }, { rejectWithValue }) => {
    try {
      const { data } = await applicationApi.getJobApplications(jobId, params);
      return data.data; // { applications, pagination }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadJobStats = createAsyncThunk(
  'applications/loadJobStats',
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await applicationApi.getJobStats(jobId);
      return { jobId, stats: data.data?.stats ?? data.data ?? data };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadAllJobStats = createAsyncThunk(
  'applications/loadAllJobStats',
  async (jobIds, { rejectWithValue }) => {
    try {
      const results = await Promise.all(
        jobIds.map(async jobId => {
          try {
            const { data } = await applicationApi.getJobStats(jobId);
            return { jobId, stats: data.data?.stats ?? data.data ?? data };
          } catch {
            return { jobId, stats: null };
          }
        })
      );
      return results;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await applicationApi.updateStatus(id, data);
      return res.data?.application ?? res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const scheduleInterview = createAsyncThunk(
  'applications/scheduleInterview',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await applicationApi.scheduleInterview(id, data);
      return res.data?.application ?? res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const cancelInterview = createAsyncThunk(
  'applications/cancelInterview',
  async (id, { rejectWithValue }) => {
    try {
      const { data: res } = await applicationApi.cancelInterview(id);
      return res.data?.application ?? res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadInterviewJoinContext = createAsyncThunk(
  'applications/loadInterviewJoinContext',
  async (applicationId, { rejectWithValue }) => {
    try {
      const { data } = await applicationApi.getInterviewJoinContext(applicationId);
      return data.data ?? data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Initial State

const initialState = {
  myApplications: [],
  jobApplications: [],
  currentApplication: null,
  jobStats: null,
  jobStatsMap: {},
  pagination: null,
  jobAppsPagination: null,
  /** Jitsi join payload from GET /applications/:id/interview-join-context */
  interviewJoinContext: null,

  loading: {
    submit: false,
    myApplications: false,
    jobApplications: false,
    currentApplication: false,
    jobStats: false,
    allJobStats: false,
    updateStatus: false,
    scheduleInterview: false,
    cancelInterview: false,
    interviewJoinContext: false,
    withdraw: false,
    updateNotes: false,
  },

  error: {
    submit: null,
    myApplications: null,
    jobApplications: null,
    currentApplication: null,
    jobStats: null,
    allJobStats: null,
    updateStatus: null,
    scheduleInterview: null,
    cancelInterview: null,
    interviewJoinContext: null,
    withdraw: null,
    updateNotes: null,
  },

  lastSubmittedApplication: null,
  appliedJobIds: [],
  appliedJobIdsLoaded: false,
};

// Slice

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearSubmitError(state) {
      state.error.submit = null;
    },
    clearLastSubmitted(state) {
      state.lastSubmittedApplication = null;
    },
    resetApplicationState() {
      return initialState;
    },
  },
  extraReducers: builder => {
    // submitApplication
    builder
      .addCase(submitApplication.pending, state => {
        state.loading.submit = true;
        state.error.submit = null;
      })
      .addCase(submitApplication.fulfilled, (state, { payload }) => {
        state.loading.submit = false;
        state.lastSubmittedApplication = payload;
        const newJobId = payload?.jobId?._id ?? payload?.jobId;
        if (newJobId && !state.appliedJobIds.includes(newJobId)) {
          state.appliedJobIds.push(newJobId);
        }
      })
      .addCase(submitApplication.rejected, (state, { payload }) => {
        state.loading.submit = false;
        state.error.submit = payload;
      });

    // loadMyApplications
    builder
      .addCase(loadMyApplications.pending, state => {
        state.loading.myApplications = true;
        state.error.myApplications = null;
      })
      .addCase(loadMyApplications.fulfilled, (state, { payload, meta }) => {
        state.loading.myApplications = false;
        state.myApplications = payload.applications ?? [];
        state.pagination = payload.pagination ?? null;
        // Update appliedJobIds only when fetching a large unfiltered set (for "already applied" persistence)
        const hasNoStatusFilter = !meta?.arg?.status || meta.arg.status === 'all';
        const isLargeFetch = (meta?.arg?.limit ?? 0) >= 100;
        if (hasNoStatusFilter && isLargeFetch) {
          state.appliedJobIds = (payload.applications ?? [])
            .map(a => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId))
            .filter(Boolean);
          state.appliedJobIdsLoaded = true;
        }
      })
      .addCase(loadMyApplications.rejected, (state, { payload }) => {
        state.loading.myApplications = false;
        state.error.myApplications = payload;
      });

    // loadApplicationById
    builder
      .addCase(loadApplicationById.pending, state => {
        state.loading.currentApplication = true;
        state.error.currentApplication = null;
      })
      .addCase(loadApplicationById.fulfilled, (state, { payload }) => {
        state.loading.currentApplication = false;
        state.currentApplication = payload;
      })
      .addCase(loadApplicationById.rejected, (state, { payload }) => {
        state.loading.currentApplication = false;
        state.error.currentApplication = payload;
      });

    // withdrawApplication
    builder
      .addCase(withdrawApplication.pending, state => {
        state.loading.withdraw = true;
        state.error.withdraw = null;
      })
      .addCase(withdrawApplication.fulfilled, (state, { payload }) => {
        state.loading.withdraw = false;
        state.myApplications = state.myApplications.map(a =>
          a._id === payload.id
            ? { ...a, status: 'withdrawn', withdrawalReason: payload.withdrawalReason }
            : a
        );
        if (state.currentApplication?._id === payload.id) {
          state.currentApplication = {
            ...state.currentApplication,
            status: 'withdrawn',
            withdrawalReason: payload.withdrawalReason,
          };
        }
      })
      .addCase(withdrawApplication.rejected, (state, { payload }) => {
        state.loading.withdraw = false;
        state.error.withdraw = payload;
      });

    // loadJobApplications
    builder
      .addCase(loadJobApplications.pending, state => {
        state.loading.jobApplications = true;
        state.error.jobApplications = null;
      })
      .addCase(loadJobApplications.fulfilled, (state, { payload }) => {
        state.loading.jobApplications = false;
        state.jobApplications = payload.applications ?? [];
        state.jobAppsPagination = payload.pagination ?? null;
      })
      .addCase(loadJobApplications.rejected, (state, { payload }) => {
        state.loading.jobApplications = false;
        state.error.jobApplications = payload;
      });

    // ── loadJobStats ──
    builder
      .addCase(loadJobStats.pending, state => {
        state.loading.jobStats = true;
        state.error.jobStats = null;
      })
      .addCase(loadJobStats.fulfilled, (state, { payload }) => {
        state.loading.jobStats = false;
        state.jobStats = payload.stats;
        state.jobStatsMap[payload.jobId] = payload.stats;
      })
      .addCase(loadJobStats.rejected, (state, { payload }) => {
        state.loading.jobStats = false;
        state.error.jobStats = payload;
      });

    // ── loadAllJobStats ──
    builder
      .addCase(loadAllJobStats.pending, state => {
        state.loading.allJobStats = true;
        state.error.allJobStats = null;
      })
      .addCase(loadAllJobStats.fulfilled, (state, { payload }) => {
        state.loading.allJobStats = false;
        for (const { jobId, stats } of payload) {
          if (stats) state.jobStatsMap[jobId] = stats;
        }
      })
      .addCase(loadAllJobStats.rejected, (state, { payload }) => {
        state.loading.allJobStats = false;
        state.error.allJobStats = payload;
      });

    // ── updateApplicationStatus ──
    builder
      .addCase(updateApplicationStatus.pending, state => {
        state.loading.updateStatus = true;
        state.error.updateStatus = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, { payload }) => {
        state.loading.updateStatus = false;
        state.jobApplications = state.jobApplications.map(a =>
          a._id === payload._id ? payload : a
        );
        if (state.currentApplication?._id === payload._id) {
          state.currentApplication = payload;
        }
      })
      .addCase(updateApplicationStatus.rejected, (state, { payload }) => {
        state.loading.updateStatus = false;
        state.error.updateStatus = payload;
      });

    // ── scheduleInterview ──
    builder
      .addCase(scheduleInterview.pending, state => {
        state.loading.scheduleInterview = true;
        state.error.scheduleInterview = null;
      })
      .addCase(scheduleInterview.fulfilled, (state, { payload }) => {
        state.loading.scheduleInterview = false;
        state.jobApplications = state.jobApplications.map(a =>
          a._id === payload._id ? payload : a
        );
        if (state.currentApplication?._id === payload._id) {
          state.currentApplication = payload;
        }
      })
      .addCase(scheduleInterview.rejected, (state, { payload }) => {
        state.loading.scheduleInterview = false;
        state.error.scheduleInterview = payload;
      });

    // ── cancelInterview ──
    builder
      .addCase(cancelInterview.pending, state => {
        state.loading.cancelInterview = true;
        state.error.cancelInterview = null;
      })
      .addCase(cancelInterview.fulfilled, (state, { payload }) => {
        state.loading.cancelInterview = false;
        state.jobApplications = state.jobApplications.map(a =>
          a._id === payload._id ? payload : a
        );
        if (state.currentApplication?._id === payload._id) {
          state.currentApplication = payload;
        }
      })
      .addCase(cancelInterview.rejected, (state, { payload }) => {
        state.loading.cancelInterview = false;
        state.error.cancelInterview = payload;
      });

    // ── loadInterviewJoinContext ──
    builder
      .addCase(loadInterviewJoinContext.pending, state => {
        state.loading.interviewJoinContext = true;
        state.error.interviewJoinContext = null;
        state.interviewJoinContext = null;
      })
      .addCase(loadInterviewJoinContext.fulfilled, (state, { payload }) => {
        state.loading.interviewJoinContext = false;
        state.interviewJoinContext = payload;
      })
      .addCase(loadInterviewJoinContext.rejected, (state, { payload }) => {
        state.loading.interviewJoinContext = false;
        state.error.interviewJoinContext = payload;
      });

    // ── updateApplicationNotes ──
    builder
      .addCase(updateApplicationNotes.pending, state => {
        state.loading.updateNotes = true;
        state.error.updateNotes = null;
      })
      .addCase(updateApplicationNotes.fulfilled, (state, { payload }) => {
        state.loading.updateNotes = false;
        state.myApplications = state.myApplications.map(a => (a._id === payload._id ? payload : a));
        if (state.currentApplication?._id === payload._id) {
          state.currentApplication = payload;
        }
      })
      .addCase(updateApplicationNotes.rejected, (state, { payload }) => {
        state.loading.updateNotes = false;
        state.error.updateNotes = payload;
      });
  },
});

export const { clearSubmitError, clearLastSubmitted, resetApplicationState } =
  applicationSlice.actions;

// Selectors

export const selectMyApplications = state => state.applications.myApplications;
export const selectJobApplications = state => state.applications.jobApplications;
export const selectCurrentApplication = state => state.applications.currentApplication;
export const selectJobStats = state => state.applications.jobStats;
export const selectJobStatsMap = state => state.applications.jobStatsMap;
export const selectJobStatsFor = jobId => state => state.applications.jobStatsMap[jobId] ?? null;
export const selectApplicationPagination = state => state.applications.pagination;
export const selectJobAppsPagination = state => state.applications.jobAppsPagination;
export const selectLastSubmittedApplication = state => state.applications.lastSubmittedApplication;
export const selectApplicationLoading = key => state => state.applications.loading[key];
export const selectApplicationError = key => state => state.applications.error[key];
export const selectAppliedJobIds = state => state.applications.appliedJobIds;
export const selectAppliedJobIdsLoaded = state => state.applications.appliedJobIdsLoaded;
export const selectHasAppliedToJob = jobId => state =>
  state.applications.appliedJobIds.includes(jobId);
export const selectInterviewJoinContext = state => state.applications.interviewJoinContext;

export default applicationSlice.reducer;
