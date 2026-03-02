import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  /**
   * Register a new user
   */
  const registerUser = async userData => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Registration failed');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify registration OTP
   */
  const verifyRegistration = async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
      // Store token & user on successful verification
      if (data.token) {
        localStorage.setItem('token', data.token);
        const { token: _token, ...user } = data;
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   */
  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || 'Login failed');
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        // eslint-disable-next-line no-unused-vars
        const { token, ...user } = data;
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  /**
   * Forgot password - send OTP
   */
  const forgotPassword = async phone => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify password reset OTP
   */
  const verifyPasswordReset = async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/verify-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
      return data; // returns { message, resetToken }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (phone, resetToken, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, resetToken, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get my profile
   */
  const getMyProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user profile by ID
   */
  const getUserProfile = async id => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/profile/${id}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile (supports file uploads)
   */
  const updateUserProfile = async updates => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const isFormData = updates instanceof FormData;
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        },
        body: isFormData ? updates : JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      // Update stored user info
      if (data._id) {
        // eslint-disable-next-line no-unused-vars
        const { token, ...user } = data;
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete user account
   */
  const deleteAccount = async password => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/account`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }
      logoutUser();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        error,
        registerUser,
        verifyRegistration,
        loginUser,
        logoutUser,
        forgotPassword,
        verifyPasswordReset,
        resetPassword,
        getMyProfile,
        getUserProfile,
        updateUserProfile,
        deleteAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
