import axios from "axios";

const api = axios.create({
  // NOTE: Use env var so the backend URL is never hardcoded in source
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // IMPORTANT: Without a timeout, a hung backend leaves ProtectedRoute
  // in "loading" state forever — the Loader spins with no way out.
  timeout: 10000,
});

export default api;
