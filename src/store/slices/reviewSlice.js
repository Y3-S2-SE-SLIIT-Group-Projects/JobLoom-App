import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as reviewApi from '../../services/reviewApi';

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Decode JWT payload from localStorage to get the current user's ID. */
export const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.id ?? null;
  } catch {
    return null;
  }
};

// ─── Async Thunks ──────────────────────────────────────────────────────────────

export const loadUserReviews = createAsyncThunk(
  'reviews/loadUserReviews',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.fetchReviewsForUser(userId, params);
      return data.data; // { reviews, pagination }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadRatingStats = createAsyncThunk(
  'reviews/loadRatingStats',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.fetchRatingStats(userId);
      return data.data.stats;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadJobReviews = createAsyncThunk(
  'reviews/loadJobReviews',
  async (jobId, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.fetchReviewsForJob(jobId);
      return data.data; // { reviews, count }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.createReview(reviewData);
      return data.data.review;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const editReview = createAsyncThunk(
  'reviews/editReview',
  async ({ reviewId, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.updateReview(reviewId, updateData);
      return data.data.review;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeReview = createAsyncThunk(
  'reviews/removeReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewApi.deleteReview(reviewId);
      return reviewId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadSentReviews = createAsyncThunk(
  'reviews/loadSentReviews',
  async ({ userId, params }, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.fetchSentReviews(userId, params);
      return data.data; // { reviews, pagination }
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const flagReview = createAsyncThunk(
  'reviews/flagReview',
  async ({ reviewId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await reviewApi.reportReview(reviewId, reason);
      return { reviewId, reportCount: data.data.reportCount };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Initial State ─────────────────────────────────────────────────────────────

const initialState = {
  userReviews: [],
  sentReviews: [],
  jobReviews: [],
  ratingStats: null,
  pagination: null,
  sentPagination: null,

  // ── UI State (moved from local useState) ──────────────────────────────────
  ui: {
    activeTab: 'received', // 'received' | 'sent'
    reviewerType: '', // '' | 'employer' | 'job_seeker'
    sort: '-createdAt', // sort param
    page: 1, // current page
  },

  loading: {
    userReviews: false,
    sentReviews: false,
    ratingStats: false,
    jobReviews: false,
    submit: false,
    edit: false,
    delete: false,
    report: false,
  },

  error: {
    userReviews: null,
    sentReviews: null,
    ratingStats: null,
    jobReviews: null,
    submit: null,
    edit: null,
    delete: null,
    report: null,
  },

  // Tracks the last successfully submitted review (useful for redirects)
  lastSubmittedReview: null,
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearSubmitError(state) {
      state.error.submit = null;
    },
    clearLastSubmitted(state) {
      state.lastSubmittedReview = null;
    },
    resetReviewState() {
      return initialState;
    },

    // ── UI Reducers ───────────────────────────────────────────────────────────
    setActiveTab(state, { payload }) {
      state.ui.activeTab = payload;
      state.ui.reviewerType = '';
      state.ui.sort = '-createdAt';
      state.ui.page = 1;
    },
    setReviewerType(state, { payload }) {
      state.ui.reviewerType = payload;
      state.ui.page = 1;
    },
    setSort(state, { payload }) {
      state.ui.sort = payload;
      state.ui.page = 1;
    },
    setPage(state, { payload }) {
      state.ui.page = payload;
    },
  },
  extraReducers: builder => {
    // ── loadUserReviews ──
    builder
      .addCase(loadUserReviews.pending, state => {
        state.loading.userReviews = true;
        state.error.userReviews = null;
      })
      .addCase(loadUserReviews.fulfilled, (state, { payload }) => {
        state.loading.userReviews = false;
        state.userReviews = payload.reviews ?? [];
        state.pagination = payload.pagination ?? null;
      })
      .addCase(loadUserReviews.rejected, (state, { payload }) => {
        state.loading.userReviews = false;
        state.error.userReviews = payload;
      });

    // ── loadRatingStats ──
    builder
      .addCase(loadRatingStats.pending, state => {
        state.loading.ratingStats = true;
        state.error.ratingStats = null;
      })
      .addCase(loadRatingStats.fulfilled, (state, { payload }) => {
        state.loading.ratingStats = false;
        state.ratingStats = payload;
      })
      .addCase(loadRatingStats.rejected, (state, { payload }) => {
        state.loading.ratingStats = false;
        state.error.ratingStats = payload;
      });

    // ── loadJobReviews ──
    builder
      .addCase(loadJobReviews.pending, state => {
        state.loading.jobReviews = true;
        state.error.jobReviews = null;
      })
      .addCase(loadJobReviews.fulfilled, (state, { payload }) => {
        state.loading.jobReviews = false;
        state.jobReviews = payload.reviews ?? [];
      })
      .addCase(loadJobReviews.rejected, (state, { payload }) => {
        state.loading.jobReviews = false;
        state.error.jobReviews = payload;
      });

    // ── submitReview ──
    builder
      .addCase(submitReview.pending, state => {
        state.loading.submit = true;
        state.error.submit = null;
      })
      .addCase(submitReview.fulfilled, (state, { payload }) => {
        state.loading.submit = false;
        state.lastSubmittedReview = payload;

        const alreadyInJobReviews = state.jobReviews.some(r => r._id === payload._id);
        if (!alreadyInJobReviews) {
          state.jobReviews = [payload, ...state.jobReviews];
        }
      })
      .addCase(submitReview.rejected, (state, { payload }) => {
        state.loading.submit = false;
        state.error.submit = payload;
      });

    // ── loadSentReviews ──
    builder
      .addCase(loadSentReviews.pending, state => {
        state.loading.sentReviews = true;
        state.error.sentReviews = null;
      })
      .addCase(loadSentReviews.fulfilled, (state, { payload }) => {
        state.loading.sentReviews = false;
        state.sentReviews = payload.reviews ?? [];
        state.sentPagination = payload.pagination ?? null;
      })
      .addCase(loadSentReviews.rejected, (state, { payload }) => {
        state.loading.sentReviews = false;
        state.error.sentReviews = payload;
      });

    // ── editReview ──
    builder
      .addCase(editReview.pending, state => {
        state.loading.edit = true;
        state.error.edit = null;
      })
      .addCase(editReview.fulfilled, (state, { payload }) => {
        state.loading.edit = false;
        state.userReviews = state.userReviews.map(r => (r._id === payload._id ? payload : r));
        state.sentReviews = state.sentReviews.map(r => (r._id === payload._id ? payload : r));
        state.jobReviews = state.jobReviews.map(r => (r._id === payload._id ? payload : r));
      })
      .addCase(editReview.rejected, (state, { payload }) => {
        state.loading.edit = false;
        state.error.edit = payload;
      });

    // ── removeReview ──
    builder
      .addCase(removeReview.pending, state => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(removeReview.fulfilled, (state, { payload: reviewId }) => {
        state.loading.delete = false;
        state.userReviews = state.userReviews.filter(r => r._id !== reviewId);
        state.sentReviews = state.sentReviews.filter(r => r._id !== reviewId);
        state.jobReviews = state.jobReviews.filter(r => r._id !== reviewId);
      })
      .addCase(removeReview.rejected, (state, { payload }) => {
        state.loading.delete = false;
        state.error.delete = payload;
      });

    // ── flagReview ──
    builder
      .addCase(flagReview.pending, state => {
        state.loading.report = true;
        state.error.report = null;
      })
      .addCase(flagReview.fulfilled, state => {
        state.loading.report = false;
      })
      .addCase(flagReview.rejected, (state, { payload }) => {
        state.loading.report = false;
        state.error.report = payload;
      });
  },
});

export const {
  clearSubmitError,
  clearLastSubmitted,
  resetReviewState,
  setActiveTab,
  setReviewerType,
  setSort,
  setPage,
} = reviewSlice.actions;

// ─── Selectors ─────────────────────────────────────────────────────────────────

export const selectUserReviews = state => state.reviews.userReviews;
export const selectSentReviews = state => state.reviews.sentReviews;
export const selectJobReviews = state => state.reviews.jobReviews;
export const selectRatingStats = state => state.reviews.ratingStats;
export const selectReviewPagination = state => state.reviews.pagination;
export const selectSentReviewPagination = state => state.reviews.sentPagination;
export const selectLastSubmittedReview = state => state.reviews.lastSubmittedReview;
export const selectReviewLoading = key => state => state.reviews.loading[key];
export const selectReviewError = key => state => state.reviews.error[key];

// UI selectors
export const selectReviewUI = state => state.reviews.ui;
export const selectActiveTab = state => state.reviews.ui.activeTab;
export const selectReviewerTypeFilter = state => state.reviews.ui.reviewerType;
export const selectReviewSort = state => state.reviews.ui.sort;
export const selectReviewPage = state => state.reviews.ui.page;

export default reviewSlice.reducer;
