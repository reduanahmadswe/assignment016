-- ORIYET Database Schema
-- MySQL Database

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS oriyet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oriyet;

-- Drop tables if exist (for clean migration)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS certificate_verifications;
DROP TABLE IF EXISTS certificates;
DROP TABLE IF EXISTS payment_transactions;
DROP TABLE IF EXISTS event_registrations;
DROP TABLE IF EXISTS event_hosts;
DROP TABLE IF EXISTS event_sessions;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS hosts;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS pages;
DROP TABLE IF EXISTS otp_codes;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role ENUM('user', 'admin') DEFAULT 'user',
    auth_provider ENUM('local', 'google') DEFAULT 'local',
    google_id VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token(255)),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OTP Codes Table
CREATE TABLE otp_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('verification', 'password_reset') DEFAULT 'verification',
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Hosts Table
CREATE TABLE hosts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_image VARCHAR(500),
    cv_link VARCHAR(500),
    social_links JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events Table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    content LONGTEXT,
    thumbnail VARCHAR(500),
    event_type ENUM('seminar', 'workshop', 'webinar') NOT NULL,
    event_mode ENUM('online', 'offline', 'hybrid') NOT NULL,
    venue_details JSON,
    online_link VARCHAR(500),
    online_platform ENUM('zoom', 'google_meet', 'other'),
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    registration_deadline DATETIME,
    is_free BOOLEAN DEFAULT TRUE,
    price DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'BDT',
    max_participants INT,
    current_participants INT DEFAULT 0,
    has_certificate BOOLEAN DEFAULT FALSE,
    registration_status ENUM('open', 'closed', 'full') DEFAULT 'open',
    event_status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
    video_link VARCHAR(500),
    session_summary TEXT,
    session_summary_pdf VARCHAR(500),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_event_type (event_type),
    INDEX idx_event_status (event_status),
    INDEX idx_registration_status (registration_status),
    INDEX idx_start_date (start_date),
    INDEX idx_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Sessions Table (for multi-session events)
CREATE TABLE event_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    speaker_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Hosts Junction Table
CREATE TABLE event_hosts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    host_id INT NOT NULL,
    role VARCHAR(100) DEFAULT 'speaker',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_host (event_id, host_id),
    INDEX idx_event_id (event_id),
    INDEX idx_host_id (host_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Registrations Table
CREATE TABLE event_registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_number VARCHAR(50) UNIQUE,
    status ENUM('pending', 'confirmed', 'cancelled', 'attended') DEFAULT 'pending',
    payment_status ENUM('not_required', 'pending', 'completed', 'failed', 'refunded') DEFAULT 'not_required',
    payment_amount DECIMAL(10, 2) DEFAULT 0.00,
    notes TEXT,
    attendance_marked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_event_user (event_id, user_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_registration_number (registration_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payment Transactions Table
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL,
    user_id INT NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    invoice_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'BDT',
    payment_method VARCHAR(50),
    gateway VARCHAR(50) DEFAULT 'uddoktapay',
    gateway_response JSON,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled') DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES event_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certificates Table
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_id VARCHAR(50) UNIQUE NOT NULL,
    registration_id INT NOT NULL,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    certificate_url VARCHAR(500),
    qr_code_data TEXT,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_count INT DEFAULT 0,
    last_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES event_registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_certificate_id (certificate_id),
    INDEX idx_user_id (user_id),
    INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certificate Verifications Log
CREATE TABLE certificate_verifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_id INT NOT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
    INDEX idx_certificate_id (certificate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blog Posts Table
CREATE TABLE blog_posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT,
    thumbnail VARCHAR(500),
    author_id INT,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags JSON,
    views INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_author_id (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Static Pages Table
CREATE TABLE pages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content LONGTEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default pages
INSERT INTO pages (title, slug, content, is_published) VALUES
('Contact Us', 'contact', '<h1>Contact Us</h1><p>Get in touch with ORIYET team.</p>', TRUE),
('Refund & Cancellation Policy', 'refund-policy', '<h1>Refund & Cancellation Policy</h1><p>Our refund and cancellation policies.</p>', TRUE),
('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us.</p>', TRUE),
('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>Terms and conditions for using ORIYET.</p>', TRUE);

-- Create default admin user (password: Admin@123)
INSERT INTO users (email, password, name, role, is_verified, is_active) VALUES
('admin@oriyet.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'admin', TRUE, TRUE);
