-- DropIndex
DROP INDEX "Base_name_key";

-- AlterTable
ALTER TABLE "Base" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Base_code_key" ON "Base"("code");
