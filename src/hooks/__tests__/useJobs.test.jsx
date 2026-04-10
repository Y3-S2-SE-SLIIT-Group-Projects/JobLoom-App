import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJobs } from '../useJobs';

const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: selector => mockUseSelector(selector),
}));

const mockFetchJobsThunk = vi.fn();
const mockFetchJobByIdThunk = vi.fn();
const mockFetchMyJobsThunk = vi.fn();
const mockFetchEmployerStatsThunk = vi.fn();
const mockCreateJobThunk = vi.fn();
const mockUpdateJobThunk = vi.fn();
const mockCloseJobThunk = vi.fn();
const mockMarkJobAsFilledThunk = vi.fn();
const mockDeleteJobThunk = vi.fn();
const mockFetchRecommendedJobsThunk = vi.fn();
const mockGenerateJobDescriptionThunk = vi.fn();
const mockUpdateFilters = vi.fn();
const mockResetFilters = vi.fn();

vi.mock('../../store/slices/jobSlice', () => ({
  fetchJobsThunk: (...args) => mockFetchJobsThunk(...args),
  fetchJobByIdThunk: (...args) => mockFetchJobByIdThunk(...args),
  fetchMyJobsThunk: (...args) => mockFetchMyJobsThunk(...args),
  fetchEmployerStatsThunk: (...args) => mockFetchEmployerStatsThunk(...args),
  createJobThunk: (...args) => mockCreateJobThunk(...args),
  updateJobThunk: (...args) => mockUpdateJobThunk(...args),
  closeJobThunk: (...args) => mockCloseJobThunk(...args),
  markJobAsFilledThunk: (...args) => mockMarkJobAsFilledThunk(...args),
  deleteJobThunk: (...args) => mockDeleteJobThunk(...args),
  fetchRecommendedJobsThunk: (...args) => mockFetchRecommendedJobsThunk(...args),
  generateJobDescriptionThunk: (...args) => mockGenerateJobDescriptionThunk(...args),
  updateFilters: (...args) => mockUpdateFilters(...args),
  resetFilters: (...args) => mockResetFilters(...args),
  selectJobs: state => state.jobs.jobs,
  selectJobsLoading: state => state.jobs.loading,
  selectJobsError: state => state.jobs.error,
  selectJobFilters: state => state.jobs.filters,
  selectJobPagination: state => state.jobs.pagination,
}));

describe('useJobs', () => {
  const state = {
    jobs: {
      jobs: [{ _id: '1', title: 'Frontend Dev' }],
      loading: false,
      error: null,
      filters: { category: 'software' },
      pagination: { page: 1, pages: 1, total: 1 },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSelector.mockImplementation(selector => selector(state));

    mockDispatch.mockImplementation(action => ({
      unwrap: () => Promise.resolve(action),
    }));
  });

  it('returns mapped state and action functions', () => {
    const { result } = renderHook(() => useJobs());

    expect(result.current.jobs).toEqual(state.jobs.jobs);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.filters).toEqual(state.jobs.filters);
    expect(result.current.pagination).toEqual(state.jobs.pagination);

    expect(typeof result.current.fetchJobs).toBe('function');
    expect(typeof result.current.createJob).toBe('function');
    expect(typeof result.current.updateFilters).toBe('function');
  });

  it('fetchJobs returns jobs from unwrapped payload', async () => {
    mockFetchJobsThunk.mockReturnValue({ type: 'jobs/fetchJobsThunk' });
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.resolve({ jobs: [{ _id: '2' }] }),
    }));

    const { result } = renderHook(() => useJobs());

    let response;
    await act(async () => {
      response = await result.current.fetchJobs({ page: 2 });
    });

    expect(mockFetchJobsThunk).toHaveBeenCalledWith({ page: 2 });
    expect(response).toEqual([{ _id: '2' }]);
  });

  it('fetchJobs returns empty array on failure', async () => {
    mockFetchJobsThunk.mockReturnValue({ type: 'jobs/fetchJobsThunk' });
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('Network error')),
    }));

    const { result } = renderHook(() => useJobs());

    await expect(result.current.fetchJobs()).resolves.toEqual([]);
  });

  it('normalizes and throws errors for async actions', async () => {
    mockFetchJobByIdThunk.mockReturnValue({ type: 'jobs/fetchJobByIdThunk' });
    mockDispatch.mockImplementation(() => ({
      unwrap: () => Promise.reject('Request failed from API'),
    }));

    const { result } = renderHook(() => useJobs());

    await expect(result.current.fetchJobById('abc')).rejects.toThrow('Request failed from API');
  });

  it('dispatches sync filter actions', () => {
    mockUpdateFilters.mockReturnValue({ type: 'jobs/updateFilters' });
    mockResetFilters.mockReturnValue({ type: 'jobs/resetFilters' });

    const { result } = renderHook(() => useJobs());

    act(() => {
      result.current.updateFilters({ location: 'Colombo' });
      result.current.resetFilters();
    });

    expect(mockUpdateFilters).toHaveBeenCalledWith({ location: 'Colombo' });
    expect(mockResetFilters).toHaveBeenCalledWith();
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });
});
