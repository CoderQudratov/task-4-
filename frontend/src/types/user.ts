// NOTE: Status values match the Prisma enum exactly — always uppercase
export interface User {
  id: string;
  name: string;
  email: string;
  // IMPORTANT: Must match Prisma Status enum: ACTIVE | BLOCKED | UNVERIFIED
  status: "ACTIVE" | "BLOCKED" | "UNVERIFIED";
  // NOTE: Computed by backend from confirmToken === null — not a DB column
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}
