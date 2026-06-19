import type { User } from "../types/user";

const STORAGE_KEY = "auth_user";

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const clearUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
