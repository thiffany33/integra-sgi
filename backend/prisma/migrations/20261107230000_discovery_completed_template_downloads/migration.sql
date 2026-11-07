ALTER TABLE "CustomerGuidedFlow" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Best available value for flows completed before this column existed.
UPDATE "CustomerGuidedFlow" SET "completedAt" = "updatedAt" WHERE "status" = 'COMPLETED';

CREATE TABLE "TemplateDownload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateDownload_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TemplateDownload_documentId_userId_idx" ON "TemplateDownload"("documentId", "userId");

CREATE INDEX "TemplateDownload_userId_idx" ON "TemplateDownload"("userId");

ALTER TABLE "TemplateDownload" ADD CONSTRAINT "TemplateDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
