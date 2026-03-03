import api from './api';

/**
 * Review API Service
 * All HTTP calls for the Review & Rating module.
 * Thin layer — no business logic, just data transport.
 */

/** @param {string} userId @param {Object} params */
export const fetchReviewsForUser = (userId, params = {}) =>
  api.get(`/reviews/user/${userId}`, { params });

/** @param {string} jobId */
export const fetchReviewsForJob = jobId => api.get(`/reviews/job/${jobId}`);

/** @param {string} userId */
export const fetchRatingStats = userId => api.get(`/reviews/stats/${userId}`);

/** @param {string} employerId @param {Object} params */
export const fetchEmployerReviews = (employerId, params = {}) =>
  api.get(`/reviews/employer/${employerId}`, { params });

/** @param {string} jobSeekerId @param {Object} params */
export const fetchJobSeekerReviews = (jobSeekerId, params = {}) =>
  api.get(`/reviews/jobseeker/${jobSeekerId}`, { params });

/** @param {string} reviewId */
export const fetchReviewById = reviewId => api.get(`/reviews/${reviewId}`);

/** @param {Object} reviewData */
export const createReview = reviewData => api.post('/reviews', reviewData);

/** @param {string} reviewId @param {Object} updateData */
export const updateReview = (reviewId, updateData) => api.put(`/reviews/${reviewId}`, updateData);

/** @param {string} reviewId */
export const deleteReview = reviewId => api.delete(`/reviews/${reviewId}`);

/** @param {string} reviewId @param {string} reason */
export const reportReview = (reviewId, reason) =>
  api.post(`/reviews/${reviewId}/report`, { reason });

/** Reviews WRITTEN by a user (they are the reviewer)
 * @param {string} userId @param {Object} params */
export const fetchSentReviews = (userId, params = {}) =>
  api.get(`/reviews/sent/${userId}`, { params });
