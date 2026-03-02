import { createContext, useContext, useState } from 'react';

const JobContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
    minSalary: '',
    maxSalary: '',
    district: '',
    province: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState(null);

  // API base URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  /**
   * Fetch all jobs with filters
   */
  const fetchJobs = async (customFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const mergedFilters = { ...filters, ...customFilters };
      const queryParams = new URLSearchParams();

      Object.entries(mergedFilters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/jobs?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      setJobs(data.data.jobs);
      setPagination(data.data.pagination);
      return data.data.jobs || [];
    } catch (err) {
      setError(err.message);
      console.error('Error fetching jobs:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch single job by ID
   */
  const fetchJobById = async jobId => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch job');
      }

      return data.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch recommended jobs for current user
   */
  const fetchRecommendedJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
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
      setError(err.message);
      console.error('Error fetching recommendations:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch employer's jobs
   */
  const fetchMyJobs = async (options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (options.includeInactive) {
        queryParams.append('includeInactive', 'true');
      }
      if (options.status) {
        queryParams.append('status', options.status);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs/employer/my-jobs?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs');
      }

      return data.data.jobs;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my jobs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch employer statistics
   */
  const fetchEmployerStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
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
      setError(err.message);
      console.error('Error fetching stats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new job
   */
  const createJob = async jobData => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
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
      setError(err.message);
      console.error('Error creating job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update a job
   */
  const updateJob = async (jobId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
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
      setError(err.message);
      console.error('Error updating job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Close a job
   */
  const closeJob = async jobId => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
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
      setError(err.message);
      console.error('Error closing job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Mark job as filled
   */
  const markJobAsFilled = async jobId => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
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
      setError(err.message);
      console.error('Error marking job as filled:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a job
   */
  const deleteJob = async jobId => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
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
      setError(err.message);
      console.error('Error deleting job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update filters
   */
  const updateFilters = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    setFilters({
      category: '',
      status: '',
      search: '',
      minSalary: '',
      maxSalary: '',
      district: '',
      province: '',
      page: 1,
      limit: 20,
    });
  };

  const value = {
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
    updateFilters,
    resetFilters,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};

export default JobContext;
