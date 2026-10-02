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

let inMemoryCsrfToken: string | null = null;

// Helper to read CSRF token from document.cookie when available (e.g. same-origin development)
const getCookieToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(^|;)\s*XSRF-TOKEN\s*=\s*([^;]+)/);
  return match ? decodeURIComponent(match[2]) : null;
};

// Response interceptor: extract X-XSRF-TOKEN / X-CSRF-TOKEN from response headers (cross-origin production)
api.interceptors.response.use(
  (response) => {
    const token =
      response.headers?.['x-xsrf-token'] ||
      response.headers?.['X-XSRF-TOKEN'] ||
      response.headers?.['x-csrf-token'] ||
      response.headers?.['X-CSRF-TOKEN'];
    if (token && typeof token === 'string') {
      inMemoryCsrfToken = token;
    }
    return response;
  },
  (error) => {
    if (error.response?.headers) {
      const token =
        error.response.headers['x-xsrf-token'] ||
        error.response.headers['X-XSRF-TOKEN'] ||
        error.response.headers['x-csrf-token'] ||
        error.response.headers['X-CSRF-TOKEN'];
      if (token && typeof token === 'string') {
        inMemoryCsrfToken = token;
      }
    }
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/me')
    ) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const res = await api.get('/auth/csrf');
    const token =
      res.headers?.['x-xsrf-token'] ||
      res.headers?.['X-XSRF-TOKEN'] ||
      res.headers?.['x-csrf-token'] ||
      res.headers?.['X-CSRF-TOKEN'];
    if (token && typeof token === 'string') {
      inMemoryCsrfToken = token;
      return token;
    }
  } catch {
    // ignore
  }
  return inMemoryCsrfToken || getCookieToken();
};

// Request interceptor: attach X-XSRF-TOKEN and X-CSRF-TOKEN headers to state-changing requests
api.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    let token = inMemoryCsrfToken || getCookieToken();
    if (!token && !config.url?.includes('/auth/login') && !config.url?.includes('/auth/logout')) {
      token = await fetchCsrfToken();
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers['X-XSRF-TOKEN'] = token;
      config.headers['X-CSRF-TOKEN'] = token;
    }
  }
  return config;
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
