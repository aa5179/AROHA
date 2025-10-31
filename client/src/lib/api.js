// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const API_ENDPOINTS = {
  ANALYZE_JOURNAL: `${API_BASE_URL}/analyze_journal`,
  CHAT: `${API_BASE_URL}/chat`,
};

export { API_BASE_URL };
