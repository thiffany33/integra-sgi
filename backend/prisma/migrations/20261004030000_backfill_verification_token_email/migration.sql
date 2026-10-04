-- Before account email editing existed, pending verification links were issued to the user's current address.
UPDATE "EmailVerificationToken" AS token
SET "email" = account."email"
FROM "User" AS account
WHERE token."userId" = account."id"
  AND token."email" IS NULL
  AND token."usedAt" IS NULL
  AND token."expiresAt" > CURRENT_TIMESTAMP;
