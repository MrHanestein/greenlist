-- AlterEnum
ALTER TYPE "SubscriptionTier" ADD VALUE 'PLUS';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contact" JSONB,
ADD COLUMN     "cvText" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deletingAt" TIMESTAMP(3),
ADD COLUMN     "emailAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "extensionVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "needsSponsorshipFuture" BOOLEAN,
ADD COLUMN     "needsSponsorshipNow" BOOLEAN,
ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subscriptionValidUntil" TIMESTAMP(3),
ADD COLUMN     "targetRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "workAuthorisedNow" BOOLEAN;

-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "snapshotId" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "canonicalKey" TEXT,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "contentHash" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "employerId" TEXT,
ADD COLUMN     "evidenceCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "evidenceQuote" TEXT,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "licenceEvidence" JSONB,
ADD COLUMN     "licenceStatus" TEXT NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN     "vacancyPolicy" TEXT NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "company" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "followUpAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "AutofillEvent" ADD COLUMN     "eventKey" TEXT;

-- CreateTable
CREATE TABLE "SponsorSnapshot" (
    "id" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceDate" TIMESTAMP(3) NOT NULL,
    "checksum" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowCount" INTEGER NOT NULL,

    CONSTRAINT "SponsorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employer" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "legalNameNorm" TEXT NOT NULL,
    "townCity" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployerAlias" (
    "id" TEXT NOT NULL,
    "aliasNorm" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "evidenceUrl" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployerAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSource" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "JobSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovedFact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovedFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationPack" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationPack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationVersion" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "requestKey" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'USER_CONFIRMED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "jobIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "emailedAt" TIMESTAMP(3),

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncRun" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SponsorSnapshot_checksum_key" ON "SponsorSnapshot"("checksum");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_legalNameNorm_key" ON "Employer"("legalNameNorm");

-- CreateIndex
CREATE UNIQUE INDEX "EmployerAlias_aliasNorm_key" ON "EmployerAlias"("aliasNorm");

-- CreateIndex
CREATE UNIQUE INDEX "JobSource_source_externalId_key" ON "JobSource"("source", "externalId");

-- CreateIndex
CREATE INDEX "ApprovedFact_userId_idx" ON "ApprovedFact"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationPack_userId_requestKey_key" ON "ApplicationPack"("userId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionEvent_applicationId_requestKey_key" ON "SubmissionEvent"("applicationId", "requestKey");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_userId_period_key" ON "Shortlist"("userId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Usage_userId_period_kind_key" ON "Usage"("userId", "period", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_key_key" ON "Notification"("userId", "key");

-- CreateIndex
CREATE INDEX "Sponsor_snapshotId_companyNameNorm_idx" ON "Sponsor"("snapshotId", "companyNameNorm");

-- CreateIndex
CREATE UNIQUE INDEX "Job_canonicalKey_key" ON "Job"("canonicalKey");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_externalUrl_key" ON "Application"("userId", "externalUrl");

-- CreateIndex
CREATE UNIQUE INDEX "AutofillEvent_userId_eventKey_key" ON "AutofillEvent"("userId", "eventKey");

-- AddForeignKey
ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "SponsorSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployerAlias" ADD CONSTRAINT "EmployerAlias_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSource" ADD CONSTRAINT "JobSource_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovedFact" ADD CONSTRAINT "ApprovedFact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationPack" ADD CONSTRAINT "ApplicationPack_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationPack" ADD CONSTRAINT "ApplicationPack_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationVersion" ADD CONSTRAINT "ApplicationVersion_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionEvent" ADD CONSTRAINT "SubmissionEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usage" ADD CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

