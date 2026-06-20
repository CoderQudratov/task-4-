// NOTE: Status values match the Prisma enum exactly — always uppercase
export interface User {
  id: string;
  name: string;
  email: string;
  status: "ACTIVE" | "BLOCKED" | "UNVERIFIED";
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}
