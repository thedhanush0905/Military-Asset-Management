-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('WEAPON', 'VEHICLE', 'AMMUNITION', 'COMMUNICATION', 'MEDICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('NOS', 'ROUNDS', 'BOXES', 'LITRES', 'KGS', 'METRES');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INITIAL_STOCK', 'PURCHASE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ASSIGNMENT', 'ASSIGNMENT_RETURN', 'EXPENDITURE');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('INITIAL_STOCK', 'PURCHASE', 'TRANSFER', 'ASSIGNMENT', 'ASSIGNMENT_RETURN', 'EXPENDITURE');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'SHIPPED', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'RETURNED', 'PARTIALLY_RETURNED', 'LOST', 'DAMAGED');

-- CreateTable
CREATE TABLE "Base" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "baseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "unit" "Unit" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "vendor" TEXT,
    "purchasedById" TEXT NOT NULL,
    "remarks" TEXT,
    "purchasedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "fromBaseId" TEXT NOT NULL,
    "toBaseId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "transferredById" TEXT NOT NULL,
    "remarks" TEXT,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
    "transferredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "assignedTo" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "returnedQuantity" INTEGER NOT NULL DEFAULT 0,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedById" TEXT NOT NULL,
    "remarks" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expenditure" (
    "id" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "expendedById" TEXT NOT NULL,
    "remarks" TEXT,
    "expendedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expenditure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "movementType" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "referenceType" "ReferenceType" NOT NULL,
    "purchaseId" TEXT,
    "transferId" TEXT,
    "assignmentId" TEXT,
    "expenditureId" TEXT,
    "createdById" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Base_name_key" ON "Base"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_baseId_idx" ON "User"("baseId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_name_key" ON "Equipment"("name");

-- CreateIndex
CREATE INDEX "Equipment_category_idx" ON "Equipment"("category");

-- CreateIndex
CREATE INDEX "Inventory_equipmentId_idx" ON "Inventory"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_baseId_equipmentId_key" ON "Inventory"("baseId", "equipmentId");

-- CreateIndex
CREATE INDEX "Purchase_baseId_idx" ON "Purchase"("baseId");

-- CreateIndex
CREATE INDEX "Purchase_equipmentId_idx" ON "Purchase"("equipmentId");

-- CreateIndex
CREATE INDEX "Purchase_purchasedAt_idx" ON "Purchase"("purchasedAt");

-- CreateIndex
CREATE INDEX "Purchase_purchasedById_idx" ON "Purchase"("purchasedById");

-- CreateIndex
CREATE INDEX "Transfer_fromBaseId_idx" ON "Transfer"("fromBaseId");

-- CreateIndex
CREATE INDEX "Transfer_toBaseId_idx" ON "Transfer"("toBaseId");

-- CreateIndex
CREATE INDEX "Transfer_equipmentId_idx" ON "Transfer"("equipmentId");

-- CreateIndex
CREATE INDEX "Transfer_transferredById_idx" ON "Transfer"("transferredById");

-- CreateIndex
CREATE INDEX "Assignment_baseId_idx" ON "Assignment"("baseId");

-- CreateIndex
CREATE INDEX "Assignment_equipmentId_idx" ON "Assignment"("equipmentId");

-- CreateIndex
CREATE INDEX "Assignment_assignedById_idx" ON "Assignment"("assignedById");

-- CreateIndex
CREATE INDEX "Expenditure_baseId_idx" ON "Expenditure"("baseId");

-- CreateIndex
CREATE INDEX "Expenditure_equipmentId_idx" ON "Expenditure"("equipmentId");

-- CreateIndex
CREATE INDEX "Expenditure_expendedById_idx" ON "Expenditure"("expendedById");

-- CreateIndex
CREATE INDEX "Ledger_baseId_idx" ON "Ledger"("baseId");

-- CreateIndex
CREATE INDEX "Ledger_equipmentId_idx" ON "Ledger"("equipmentId");

-- CreateIndex
CREATE INDEX "Ledger_movementType_idx" ON "Ledger"("movementType");

-- CreateIndex
CREATE INDEX "Ledger_createdAt_idx" ON "Ledger"("createdAt");

-- CreateIndex
CREATE INDEX "Ledger_baseId_equipmentId_createdAt_idx" ON "Ledger"("baseId", "equipmentId", "createdAt");

-- CreateIndex
CREATE INDEX "Ledger_baseId_createdAt_idx" ON "Ledger"("baseId", "createdAt");

-- CreateIndex
CREATE INDEX "Ledger_purchaseId_idx" ON "Ledger"("purchaseId");

-- CreateIndex
CREATE INDEX "Ledger_transferId_idx" ON "Ledger"("transferId");

-- CreateIndex
CREATE INDEX "Ledger_assignmentId_idx" ON "Ledger"("assignmentId");

-- CreateIndex
CREATE INDEX "Ledger_expenditureId_idx" ON "Ledger"("expenditureId");

-- CreateIndex
CREATE INDEX "Ledger_createdById_idx" ON "Ledger"("createdById");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_fromBaseId_fkey" FOREIGN KEY ("fromBaseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_toBaseId_fkey" FOREIGN KEY ("toBaseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_transferredById_fkey" FOREIGN KEY ("transferredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenditure" ADD CONSTRAINT "Expenditure_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenditure" ADD CONSTRAINT "Expenditure_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expenditure" ADD CONSTRAINT "Expenditure_expendedById_fkey" FOREIGN KEY ("expendedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "Transfer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_expenditureId_fkey" FOREIGN KEY ("expenditureId") REFERENCES "Expenditure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
