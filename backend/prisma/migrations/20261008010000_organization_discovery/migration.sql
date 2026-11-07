-- CreateEnum
CREATE TYPE "CustomerGuidedFlowStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "CustomerRequirementResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerRequirementResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerGuidedFlow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flowKey" TEXT NOT NULL,
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completedSteps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" "CustomerGuidedFlowStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerGuidedFlow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerRequirementResponse_userId_idx" ON "CustomerRequirementResponse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerRequirementResponse_userId_requirementCode_key" ON "CustomerRequirementResponse"("userId", "requirementCode");

-- CreateIndex
CREATE INDEX "CustomerGuidedFlow_userId_idx" ON "CustomerGuidedFlow"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerGuidedFlow_userId_flowKey_key" ON "CustomerGuidedFlow"("userId", "flowKey");

-- AddForeignKey
ALTER TABLE "CustomerRequirementResponse" ADD CONSTRAINT "CustomerRequirementResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerGuidedFlow" ADD CONSTRAINT "CustomerGuidedFlow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
