-- Legacy tokens have no trustworthy address binding and must not verify a later address.
ALTER TABLE "EmailVerificationToken" ADD COLUMN "email" VARCHAR(254);
