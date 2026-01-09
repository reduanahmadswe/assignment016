/*
  Warnings:

  - You are about to drop the `event_hosts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hosts` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN "guests" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "event_hosts";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "guests";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "hosts";
PRAGMA foreign_keys=on;
