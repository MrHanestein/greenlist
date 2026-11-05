-- AlterTable
ALTER TABLE "SponsorSnapshot" ADD COLUMN     "archiveChecksum" TEXT,
ADD COLUMN     "archivePath" TEXT,
ADD COLUMN     "archivedAt" TIMESTAMP(3);
