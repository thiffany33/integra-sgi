-- Replace the two-value role with a flag: administrators have isAdmin, everyone else is a customer.
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User" SET "isAdmin" = true WHERE "role" = 'PLATFORM_ADMIN';

ALTER TABLE "User" DROP COLUMN "role";

DROP TYPE "UserRole";
