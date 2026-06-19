import api from "./axios";
import type { User } from "../types/user";

// NOTE: Backend returns { success, users: User[] } — extract the array here
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<{ success: boolean; users: User[] }>("/users");
  return response.data.users;
};

export const blockUsers = async (ids: string[]) => {
  const response = await api.patch("/users/block", {
    ids,
  });

  return response.data;
};

export const unblockUsers = async (ids: string[]) => {
  const response = await api.patch("/users/unblock", {
    ids,
  });

  return response.data;
};

export const deleteUsers = async (ids: string[]) => {
  const response = await api.delete("/users", {
    data: { ids },
  });

  return response.data;
};

export const deleteUnverifiedUsers = async () => {
  const response = await api.delete(
    "/users/delete-unverified"
  );

  return response.data;
};