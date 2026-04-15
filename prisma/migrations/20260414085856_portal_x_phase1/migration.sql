-- CreateEnum
CREATE TYPE "AffiliateType" AS ENUM ('TYPING_CENTRE', 'BROKER', 'B2C', 'CORPORATE');

-- CreateEnum
CREATE TYPE "AffiliateStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OPERATOR', 'SUPER_USER', 'SUB_USER');

-- CreateEnum
CREATE TYPE "TierName" AS ENUM ('CORE', 'PULSE', 'ZENITH');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING_KYC', 'PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'RAHA_PROCESSING', 'ABNIC_PROCESSING', 'COMPLETE', 'FAILED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('RAHA', 'ABNIC');

-- CreateEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('WHATSAPP', 'EMAIL');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'FALLBACK_TRIGGERED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SUB_USER',
    "affiliateId" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "memberNameEn" TEXT NOT NULL,
    "memberNameAr" TEXT,
    "emiratesId" TEXT,
    "planId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "insurer" TEXT NOT NULL,
    "annualPremium" DECIMAL(12,2) NOT NULL,
    "network" TEXT,
    "tpa" TEXT,
    "ecardPath" TEXT NOT NULL,
    "certPath" TEXT NOT NULL,
    "effectiveDate" DATE NOT NULL,
    "expiryDate" DATE NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" JSONB,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAsset" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "documentType" TEXT NOT NULL,
    "originalName" TEXT,
    "storagePath" TEXT,
    "parseResult" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliates" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "affiliateType" "AffiliateType" NOT NULL,
    "status" "AffiliateStatus" NOT NULL DEFAULT 'ACTIVE',
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affinity_bundles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affinity_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affinity_tiers" (
    "id" TEXT NOT NULL,
    "bundleId" TEXT NOT NULL,
    "tierName" "TierName" NOT NULL,
    "totalAmountAed" DECIMAL(10,2) NOT NULL,
    "rahaSplitAed" DECIMAL(10,2) NOT NULL,
    "insurerSplitAed" DECIMAL(10,2) NOT NULL,
    "planCode" TEXT NOT NULL,
    "description" TEXT,
    "benefits" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "affinity_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(50) NOT NULL,
    "userId" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "tierId" TEXT,
    "programmeBundle" TEXT,
    "totalAmountAed" DECIMAL(10,2),
    "rahaSplitAed" DECIMAL(10,2),
    "insurerSplitAed" DECIMAL(10,2),
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING_KYC',
    "gatewayRef" VARCHAR(100),
    "rahaMemberId" VARCHAR(100),
    "abnicPolicyId" VARCHAR(100),
    "rahaCardUrl" TEXT,
    "abnicCardUrl" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "flaggedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_kyc" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "whatsapp" VARCHAR(30) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sponsorId" VARCHAR(50) NOT NULL,
    "emiratesId" VARCHAR(255),
    "doc1S3Key" VARCHAR(500),
    "doc2S3Key" VARCHAR(500),
    "doc3S3Key" VARCHAR(500),
    "doc4S3Key" VARCHAR(500),
    "purgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_delivery_logs" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "cardType" "CardType" NOT NULL,
    "channel" "DeliveryChannel" NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "QuoteRequest_userId_idx" ON "QuoteRequest"("userId");

-- CreateIndex
CREATE INDEX "QuoteRequest_createdAt_idx" ON "QuoteRequest"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_policyNumber_key" ON "Policy"("policyNumber");

-- CreateIndex
CREATE INDEX "Policy_userId_idx" ON "Policy"("userId");

-- CreateIndex
CREATE INDEX "Policy_issuedAt_idx" ON "Policy"("issuedAt");

-- CreateIndex
CREATE INDEX "ContactLead_receivedAt_idx" ON "ContactLead"("receivedAt");

-- CreateIndex
CREATE INDEX "DocumentAsset_userId_idx" ON "DocumentAsset"("userId");

-- CreateIndex
CREATE INDEX "DocumentAsset_createdAt_idx" ON "DocumentAsset"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_code_key" ON "affiliates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "affinity_bundles_name_key" ON "affinity_bundles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "affinity_tiers_bundleId_tierName_key" ON "affinity_tiers"("bundleId", "tierName");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "member_kyc_transactionId_key" ON "member_kyc"("transactionId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentAsset" ADD CONSTRAINT "DocumentAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affinity_tiers" ADD CONSTRAINT "affinity_tiers_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "affinity_bundles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "affinity_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_kyc" ADD CONSTRAINT "member_kyc_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_delivery_logs" ADD CONSTRAINT "card_delivery_logs_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
