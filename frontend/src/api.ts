import axios from 'axios';

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleanUrl = envUrl.trim().replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return import.meta.env.PROD
    ? 'https://nmit-confession.onrender.com/api'
    : '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export const getDiscoveryFeed = (from: string, to: string, page = 0, size = 20, category?: string) => {
  return api.get('/confessions/discover', { params: { from, to, page, size, category } });
};

export const getTodayDiscoveryFeed = (page = 0, size = 20, category?: string) => {
  return api.get('/confessions/discover/today', { params: { page, size, category } });
};

export const getDailyArchive = (date: string, page = 0, size = 20, category?: string) => {
  return api.get(`/confessions/archive/day/${date}`, { params: { page, size, category } });
};

export const getWeeklyArchive = (year: number, week: number, page = 0, size = 20, category?: string) => {
  return api.get(`/confessions/archive/week/${year}/${week}`, { params: { page, size, category } });
};

export const getMonthlyArchive = (year: number, month: number, page = 0, size = 20, category?: string) => {
  return api.get(`/confessions/archive/month/${year}/${month}`, { params: { page, size, category } });
};

export const searchConfessions = (q: string, page = 0, size = 20, category?: string) => {
  return api.get('/confessions/search', { params: { q, page, size, category } });
};

export const getTrendingConfessions = (page = 0, size = 20, category?: string) => {
  return api.get('/confessions/trending', { params: { page, size, category } });
};

export const getDailyConfession = () => {
  return api.get('/confessions/daily');
};

export const getModerationQueue = (
  page = 0,
  size = 20,
  status = 'PENDING',
  category?: string,
  flag?: string,
  from?: string,
  to?: string,
  sort = 'priority'
) => {
  return api.get('/admin/moderation/confessions', { 
    params: { page, size, status, category, flag, from, to, sort } 
  });
};

export const getAdminReports = (
  page = 0,
  size = 20,
  status?: string,
  reason?: string,
  confessionStatus?: string,
  from?: string,
  to?: string,
  sort = 'newest'
) => {
  return api.get('/admin/reports', {
    params: { page, size, status, reason, confessionStatus, from, to, sort }
  });
};

export const resolveAdminReport = (id: number) => {
  return api.patch(`/admin/reports/${id}/resolve`);
};

export const getAdminDashboard = () => {
  return api.get('/admin/dashboard');
};

export default api;
