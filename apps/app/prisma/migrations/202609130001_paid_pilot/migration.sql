-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'REPLIED';

-- AlterTable
ALTER TABLE "ApplicationPack" ADD COLUMN     "revision" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "boardProvider" TEXT,
ADD COLUMN     "boardToken" TEXT,
ADD COLUMN     "careersUrl" TEXT,
ADD COLUMN     "feedApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissionEvidenceUrl" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "evidenceVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "searchStatus" TEXT NOT NULL DEFAULT 'SEARCHING',
ADD COLUMN     "subscriptionPeriodStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PackRevision" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reservedMicros" INTEGER NOT NULL,
    "actualMicros" INTEGER,
    "budgetPeriod" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBudget" (
    "period" TEXT NOT NULL,
    "spentMicros" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ServiceBudget_pkey" PRIMARY KEY ("period")
);

-- CreateTable
CREATE TABLE "JobFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackRevision_packId_revision_key" ON "PackRevision"("packId", "revision");

-- CreateIndex
CREATE INDEX "AiRun_status_expiresAt_idx" ON "AiRun"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiRun_userId_requestKey_key" ON "AiRun"("userId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "JobFeedback_userId_jobId_key" ON "JobFeedback"("userId", "jobId");

-- CreateIndex
CREATE INDEX "ProductEvent_kind_createdAt_idx" ON "ProductEvent"("kind", "createdAt");

-- CreateIndex
CREATE INDEX "ProductEvent_userId_createdAt_idx" ON "ProductEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Job_closedAt_lastCheckedAt_id_idx" ON "Job"("closedAt", "lastCheckedAt", "id");

-- AddForeignKey
ALTER TABLE "PackRevision" ADD CONSTRAINT "PackRevision_packId_fkey" FOREIGN KEY ("packId") REFERENCES "ApplicationPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiRun" ADD CONSTRAINT "AiRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFeedback" ADD CONSTRAINT "JobFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobFeedback" ADD CONSTRAINT "JobFeedback_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEvent" ADD CONSTRAINT "ProductEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
