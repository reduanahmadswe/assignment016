-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "auth_provider" TEXT NOT NULL DEFAULT 'local',
    "google_id" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'verification',
    "expires_at" DATETIME NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "hosts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT,
    "profile_image" TEXT,
    "cv_link" TEXT,
    "social_links" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "events" (
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
    "guest_picture_link" TEXT,
    "guest_email" TEXT,
    "guest_website" TEXT,
    "guest_cv_link" TEXT,
    "created_by" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_sessions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "speaker_name" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_hosts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_id" INTEGER NOT NULL,
    "host_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'speaker',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_hosts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_hosts_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "hosts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "registration_number" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_status" TEXT NOT NULL DEFAULT 'not_required',
    "payment_amount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "attendance_marked_at" DATETIME,
    "cancelled_at" DATETIME,
    "cancel_reason" TEXT,
    "confirmed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "registration_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "transaction_id" TEXT,
    "invoice_id" TEXT,
    "gateway_transaction_id" TEXT,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "payment_method" TEXT,
    "sender_number" TEXT,
    "gateway" TEXT NOT NULL DEFAULT 'uddoktapay',
    "gateway_response" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" DATETIME,
    "refunded_at" DATETIME,
    "refund_reason" TEXT,
    "refunded_by" INTEGER,
    "expires_at" DATETIME,
    "verification_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_verified_at" DATETIME,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payment_transactions_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certificate_id" TEXT NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "certificate_url" TEXT,
    "qr_code_data" TEXT,
    "issued_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verification_count" INTEGER NOT NULL DEFAULT 0,
    "last_verified_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "certificates_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "certificates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "certificates_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "certificate_verifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certificate_id" INTEGER NOT NULL,
    "verified_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    CONSTRAINT "certificate_verifications_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "thumbnail" TEXT,
    "author_id" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "meta_title" TEXT,
    "meta_description" TEXT,
    "tags" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "published_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "location" TEXT,
    "duration" TEXT,
    "deadline" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'open',
    "banner" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "opportunity_applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "opportunity_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "cv_link" TEXT NOT NULL,
    "image_link" TEXT,
    "portfolio_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "opportunity_applications_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "event_hosts_event_id_host_id_key" ON "event_hosts"("event_id", "host_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_registration_number_key" ON "event_registrations"("registration_number");

-- CreateIndex
CREATE INDEX "event_registrations_status_payment_status_idx" ON "event_registrations"("status", "payment_status");

-- CreateIndex
CREATE INDEX "event_registrations_user_id_status_idx" ON "event_registrations"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_transaction_id_key" ON "payment_transactions"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_invoice_id_key" ON "payment_transactions"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_transactions_status_created_at_idx" ON "payment_transactions"("status", "created_at");

-- CreateIndex
CREATE INDEX "payment_transactions_invoice_id_status_idx" ON "payment_transactions"("invoice_id", "status");

-- CreateIndex
CREATE INDEX "payment_transactions_user_id_status_idx" ON "payment_transactions"("user_id", "status");

-- CreateIndex
CREATE INDEX "payment_transactions_expires_at_status_idx" ON "payment_transactions"("expires_at", "status");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificate_id_key" ON "certificates"("certificate_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_slug_key" ON "opportunities"("slug");
