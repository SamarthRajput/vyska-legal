-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT,
    "language" TEXT,
    "referer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Consent_ip_idx" ON "Consent"("ip");

-- CreateIndex
CREATE INDEX "Consent_createdAt_idx" ON "Consent"("createdAt");
