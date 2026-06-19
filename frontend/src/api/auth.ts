import api from "./axios";
import type { User } from "../types/user";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// NOTE: Called by ProtectedRoute on every mount to validate the active session.
// Backend reads the httpOnly cookie — JS cannot read it directly.
// Returns 401 if not authenticated, 403 if blocked.
export const getMe = async (): Promise<User> => {
  // IMPORTANT: Backend wraps the user in { success, user } — extract user here
  const response = await api.get<{ success: boolean; user: User }>("/auth/me");
  return response.data.user;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

// NOTE: Called by the frontend Verify page — reads token from the URL and
// sends it to the backend to activate the user's account.
export const verifyEmailToken = async (
  token: string
): Promise<{ success: boolean; message: string }> => {
  const response = await api.get<{ success: boolean; message: string }>(
    `/auth/verify/${token}`
  );
  return response.data;
};
