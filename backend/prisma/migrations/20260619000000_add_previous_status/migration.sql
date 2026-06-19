-- Add previousStatus column to store status before a user is blocked.
-- Nullable because existing users have no previous status recorded yet.
ALTER TABLE "User" ADD COLUMN "previousStatus" "Status";
