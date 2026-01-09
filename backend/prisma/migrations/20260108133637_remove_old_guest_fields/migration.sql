/*
  Warnings:

  - You are about to drop the column `guest_cv_link` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `guest_email` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `guest_picture_link` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `guest_website` on the `events` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "thumbnail" TEXT,
    "event_type" TEXT NOT NULL,
    "event_mode" TEXT NOT NULL,
    "venue_details" TEXT,
    "online_link" TEXT,
    "online_platform" TEXT,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "registration_deadline" DATETIME,
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "price" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "max_participants" INTEGER,
    "current_participants" INTEGER NOT NULL DEFAULT 0,
    "has_certificate" BOOLEAN NOT NULL DEFAULT false,
    "registration_status" TEXT NOT NULL DEFAULT 'open',
    "event_status" TEXT NOT NULL DEFAULT 'upcoming',
    "video_link" TEXT,
    "session_summary" TEXT,
    "session_summary_pdf" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_certificate_available" BOOLEAN NOT NULL DEFAULT false,
    "meeting_platform" TEXT,
    "meeting_link" TEXT,
    "auto_send_meeting_link" BOOLEAN NOT NULL DEFAULT true,
    "event_contact_email" TEXT,
    "event_contact_phone" TEXT,
    "guests" TEXT,
    "created_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_events" ("auto_send_meeting_link", "content", "created_at", "created_by", "currency", "current_participants", "description", "end_date", "event_contact_email", "event_contact_phone", "event_mode", "event_status", "event_type", "guests", "has_certificate", "id", "is_certificate_available", "is_featured", "is_free", "is_published", "max_participants", "meeting_link", "meeting_platform", "meta_description", "meta_title", "online_link", "online_platform", "price", "registration_deadline", "registration_status", "session_summary", "session_summary_pdf", "slug", "start_date", "thumbnail", "title", "updated_at", "venue_details", "video_link") SELECT "auto_send_meeting_link", "content", "created_at", "created_by", "currency", "current_participants", "description", "end_date", "event_contact_email", "event_contact_phone", "event_mode", "event_status", "event_type", "guests", "has_certificate", "id", "is_certificate_available", "is_featured", "is_free", "is_published", "max_participants", "meeting_link", "meeting_platform", "meta_description", "meta_title", "online_link", "online_platform", "price", "registration_deadline", "registration_status", "session_summary", "session_summary_pdf", "slug", "start_date", "thumbnail", "title", "updated_at", "venue_details", "video_link" FROM "events";
DROP TABLE "events";
ALTER TABLE "new_events" RENAME TO "events";
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
