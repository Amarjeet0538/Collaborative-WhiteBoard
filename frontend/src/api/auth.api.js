import { apiFetch } from './client.js';

export const authApi = {
  login: async (email, password) => {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  forgotPassword: async (email) => {
    return apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, password) => {
    return apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  getMe: async () => {
    return apiFetch('/auth/me');
  },

  // Full-page redirect target that starts the Google/GitHub OAuth flow
  oauthUrl: (provider) =>
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/${provider}`,
};