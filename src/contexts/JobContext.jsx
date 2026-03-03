import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  closeJobThunk,
  createJobThunk,
  deleteJobThunk,
  fetchEmployerStatsThunk,
  fetchJobByIdThunk,
  fetchJobsThunk,
  fetchMyJobsThunk,
  fetchRecommendedJobsThunk,
  generateJobDescriptionThunk,
  markJobAsFilledThunk,
  resetFilters as resetJobFilters,
  selectJobFilters,
  selectJobPagination,
  selectJobs,
  selectJobsError,
  selectJobsLoading,
  updateFilters as updateJobFilters,
  updateJobThunk,
} from '../store/slices/jobSlice';

const normalizeError = err => {
  if (err instanceof Error) return err;
  return new Error(typeof err === 'string' ? err : 'Request failed');
};

// Backward-compatible provider so existing tree structure remains unchanged.
export const JobProvider = ({ children }) => children;

// eslint-disable-next-line react-refresh/only-export-components
export const useJobs = () => {
  const dispatch = useDispatch();
  const jobs = useSelector(selectJobs);
  const loading = useSelector(selectJobsLoading);
  const error = useSelector(selectJobsError);
  const filters = useSelector(selectJobFilters);
  const pagination = useSelector(selectJobPagination);

  const fetchJobs = useCallback(
    async (customFilters = {}) => {
      try {
        const result = await dispatch(fetchJobsThunk(customFilters)).unwrap();
        return result.jobs || [];
      } catch {
        return [];
      }
    },
    [dispatch]
  );

  const fetchJobById = useCallback(
    async jobId => {
      try {
        return await dispatch(fetchJobByIdThunk(jobId)).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const fetchRecommendedJobs = useCallback(async () => {
    try {
      return await dispatch(fetchRecommendedJobsThunk()).unwrap();
    } catch (err) {
      throw normalizeError(err);
    }
  }, [dispatch]);

  const fetchMyJobs = useCallback(
    async (options = {}) => {
      try {
        return await dispatch(fetchMyJobsThunk(options)).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const fetchEmployerStats = useCallback(async () => {
    try {
      return await dispatch(fetchEmployerStatsThunk()).unwrap();
    } catch (err) {
      throw normalizeError(err);
    }
  }, [dispatch]);

  const createJob = useCallback(
    async jobData => {
      try {
        return await dispatch(createJobThunk(jobData)).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const updateJob = useCallback(
    async (jobId, updates) => {
      try {
        return await dispatch(updateJobThunk({ jobId, updates })).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const closeJob = useCallback(
    async jobId => {
      try {
        return await dispatch(closeJobThunk(jobId)).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const markJobAsFilled = useCallback(
    async jobId => {
      try {
        return await dispatch(markJobAsFilledThunk(jobId)).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const deleteJob = useCallback(
    async jobId => {
      try {
        return await dispatch(deleteJobThunk(jobId)).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const generateJobDescription = useCallback(
    async draftData => {
      try {
        return await dispatch(generateJobDescriptionThunk(draftData)).unwrap();
      } catch (err) {
        throw normalizeError(err);
      }
    },
    [dispatch]
  );

  const updateFilters = useCallback(
    newFilters => {
      dispatch(updateJobFilters(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(resetJobFilters());
  }, [dispatch]);

  return {
    jobs,
    loading,
    error,
    filters,
    pagination,
    fetchJobs,
    fetchJobById,
    fetchMyJobs,
    fetchEmployerStats,
    createJob,
    updateJob,
    closeJob,
    markJobAsFilled,
    deleteJob,
    fetchRecommendedJobs,
    generateJobDescription,
    updateFilters,
    resetFilters,
  };
};

export default null;
