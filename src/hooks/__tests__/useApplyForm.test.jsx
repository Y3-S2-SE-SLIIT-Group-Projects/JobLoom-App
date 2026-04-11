import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useApplyForm from '../useApplyForm';

const mockDispatch = vi.fn();
const mockUseSelector = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: selector => mockUseSelector(selector),
}));

const mockSubmitApplication = vi.fn();
const mockClearSubmitError = vi.fn();
const mockClearLastSubmitted = vi.fn();

vi.mock('../../store/slices/applicationSlice', () => ({
  submitApplication: (...args) => mockSubmitApplication(...args),
  clearSubmitError: (...args) => mockClearSubmitError(...args),
  clearLastSubmitted: (...args) => mockClearLastSubmitted(...args),
  selectApplicationLoading: key => state => state.applications.loading[key],
  selectApplicationError: key => state => state.applications.error[key],
  selectLastSubmittedApplication: state => state.applications.lastSubmittedApplication,
}));

describe('useApplyForm', () => {
  const state = {
    applications: {
      loading: { submit: false },
      error: { submit: null },
      lastSubmittedApplication: { _id: 'a1' },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSelector.mockImplementation(selector => selector(state));
    mockDispatch.mockImplementation(action => action);
  });

  it('initializes with defaults and updates fields', () => {
    const { result } = renderHook(() => useApplyForm({ jobId: 'job-1' }));

    expect(result.current.form.jobId).toBe('job-1');

    act(() => {
      result.current.setField('coverLetter', 'My letter');
      result.current.handleChange({ target: { name: 'resumeUrl', value: ' https://cv.url ' } });
    });

    expect(result.current.form.coverLetter).toBe('My letter');
    expect(result.current.form.resumeUrl).toBe(' https://cv.url ');
  });

  it('builds submit payload with cvId over resumeUrl and dispatches submit', async () => {
    mockSubmitApplication.mockReturnValue({ type: 'applications/submit' });
    const { result } = renderHook(() => useApplyForm({ jobId: 'job-2' }));

    act(() => {
      result.current.setField('coverLetter', ' Cover letter text ');
      result.current.setField('resumeUrl', ' https://resume.url ');
      result.current.setField('selectedCvId', 'cv-123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockSubmitApplication).toHaveBeenCalledWith({
      jobId: 'job-2',
      coverLetter: 'Cover letter text',
      cvId: 'cv-123',
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'applications/submit' });
  });

  it('resets form and clears submit state', () => {
    mockClearSubmitError.mockReturnValue({ type: 'applications/clearSubmitError' });
    mockClearLastSubmitted.mockReturnValue({ type: 'applications/clearLastSubmitted' });

    const { result } = renderHook(() => useApplyForm({ jobId: 'job-3' }));

    act(() => {
      result.current.setField('coverLetter', 'temp');
      result.current.resetForm();
    });

    expect(result.current.form).toEqual({
      jobId: 'job-3',
      coverLetter: '',
      resumeUrl: '',
      selectedCvId: '',
    });
    expect(mockClearSubmitError).toHaveBeenCalledWith();
    expect(mockClearLastSubmitted).toHaveBeenCalledWith();
  });
});
