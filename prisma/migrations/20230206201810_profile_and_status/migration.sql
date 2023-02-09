-- AlterTable
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "birthday" DATETIME NOT NULL,
    "gender" TEXT,
    "preference" TEXT,
    "location" TEXT,
    "profile_pic_id" TEXT,
    "facebook_url" TEXT,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Status" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lat" REAL NOT NULL,
    "long" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "text" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "preference" TEXT,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "like_count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_gender_idx" ON "Profile"("gender");

-- CreateIndex
CREATE INDEX "Profile_preference_idx" ON "Profile"("preference");

-- CreateIndex
CREATE INDEX "Status_lat_long_date_idx" ON "Status"("lat", "long", "date");

-- CreateIndex
CREATE INDEX "Status_age_preference_idx" ON "Status"("age", "preference");
