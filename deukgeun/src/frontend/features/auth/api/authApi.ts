// features/auth/api/authApi.ts
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/auth",
  withCredentials: true,
});

export const login = (
  email: string,
  password: string,
  recaptchaToken: string
) => API.post("/login", { email, password, recaptchaToken });

export const register = (
  email: string,
  password: string,
  recaptchaToken: string
) => API.post("/register", { email, password, recaptchaToken });

export const refresh = () => API.post("/refresh");

export const logout = () => API.post("/logout");
