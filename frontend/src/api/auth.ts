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

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<{ success: boolean; user: User }>("/auth/me");
  return response.data.user;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

export const verifyEmailToken = async (
  token: string,
): Promise<{ success: boolean; message: string }> => {
  const response = await api.get<{ success: boolean; message: string }>(
    `/auth/verify/${token}`,
  );
  return response.data;
};
