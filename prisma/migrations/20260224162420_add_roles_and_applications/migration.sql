-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT DEFAULT 'student';

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "reason" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
