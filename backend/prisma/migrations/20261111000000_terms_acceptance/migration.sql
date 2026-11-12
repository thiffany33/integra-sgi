-- Terms of Use (with the data processing agreement) accepted by each account; existing accounts accept on their next sign-in.
ALTER TABLE "User" ADD COLUMN "termsVersion" VARCHAR(32), ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);
