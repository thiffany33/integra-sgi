CREATE TABLE "CustomerSystemsChange" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "targetUserId" TEXT NOT NULL,
  "previousSystems" JSONB NOT NULL,
  "newSystems" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerSystemsChange_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerSystemsChange_actorUserId_idx" ON "CustomerSystemsChange"("actorUserId");
CREATE INDEX "CustomerSystemsChange_targetUserId_createdAt_idx" ON "CustomerSystemsChange"("targetUserId", "createdAt");

ALTER TABLE "CustomerSystemsChange" ADD CONSTRAINT "CustomerSystemsChange_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerSystemsChange" ADD CONSTRAINT "CustomerSystemsChange_targetUserId_fkey"
  FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
