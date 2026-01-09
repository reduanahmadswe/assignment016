-- ORIYET Demo Data Seed (English Version)
-- Run this after schema.sql

-- =============================================
-- USERS (Admin + Demo Users)
-- Password for all users: Password@123
-- Bcrypt hash: $2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K
-- =============================================

-- Clear existing demo data (keep schema intact)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE certificate_verifications;
TRUNCATE TABLE certificates;
TRUNCATE TABLE payment_transactions;
TRUNCATE TABLE event_registrations;
TRUNCATE TABLE event_hosts;
TRUNCATE TABLE event_sessions;
TRUNCATE TABLE events;
TRUNCATE TABLE hosts;
TRUNCATE TABLE blog_posts;
TRUNCATE TABLE otp_codes;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Admin User
INSERT INTO users (id, email, password, name, phone, role, is_verified, is_active, created_at) VALUES
(1, 'admin@oriyet.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'Admin User', '01700000001', 'admin', TRUE, TRUE, NOW() - INTERVAL 30 DAY);

-- Demo Users
INSERT INTO users (id, email, password, name, phone, role, is_verified, is_active, created_at) VALUES
(2, 'john@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'John Smith', '01711111111', 'user', TRUE, TRUE, NOW() - INTERVAL 25 DAY),
(3, 'sarah@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'Sarah Johnson', '01722222222', 'user', TRUE, TRUE, NOW() - INTERVAL 20 DAY),
(4, 'mike@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'Mike Wilson', '01733333333', 'user', TRUE, TRUE, NOW() - INTERVAL 15 DAY),
(5, 'emily@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'Emily Davis', '01744444444', 'user', TRUE, TRUE, NOW() - INTERVAL 10 DAY),
(6, 'david@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'David Brown', '01755555555', 'user', TRUE, TRUE, NOW() - INTERVAL 7 DAY),
(7, 'lisa@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'Lisa Anderson', '01766666666', 'user', TRUE, TRUE, NOW() - INTERVAL 5 DAY),
(8, 'james@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'James Taylor', '01777777777', 'user', TRUE, TRUE, NOW() - INTERVAL 3 DAY),
(9, 'emma@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'Emma Martinez', '01788888888', 'user', TRUE, TRUE, NOW() - INTERVAL 2 DAY),
(10, 'chris@example.com', '$2a$10$0t4n/Casf0s3FFVrHHlAPu6IdtiJaGDtXce09EboQPMq2EALede.K', 'Chris Garcia', '01799999999', 'user', TRUE, TRUE, NOW() - INTERVAL 1 DAY);

-- =============================================
-- HOSTS (Speakers/Instructors)
-- =============================================
INSERT INTO hosts (id, name, email, bio, profile_image, cv_link, social_links, is_active, created_at) VALUES
(1, 'Dr. Mahmud Rahman', 'mahmud@oriyet.com', 'Professor of Computer Science at Dhaka University. 20+ years of experience in Software Engineering and Artificial Intelligence. Published researcher with expertise in machine learning algorithms.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', 'https://linkedin.com/in/mahmudrahman', '{"linkedin": "https://linkedin.com/in/mahmudrahman", "twitter": "https://twitter.com/mahmudrahman", "website": "https://mahmudrahman.com"}', TRUE, NOW() - INTERVAL 30 DAY),

(2, 'Eng. Sabrina Sultana', 'sabrina@oriyet.com', 'Senior Software Engineer at Google. Expert in Web Development and Cloud Computing. Former tech lead at multiple startups with a passion for teaching modern web technologies.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 'https://linkedin.com/in/sabrinasultana', '{"linkedin": "https://linkedin.com/in/sabrinasultana", "github": "https://github.com/sabrinasultana"}', TRUE, NOW() - INTERVAL 25 DAY),

(3, 'Dr. Anisur Khan', 'anisur@oriyet.com', 'Associate Professor of Electrical Engineering at BUET. IoT and Embedded Systems researcher with multiple international publications. Consultant for smart city projects.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 'https://linkedin.com/in/anisurkhan', '{"linkedin": "https://linkedin.com/in/anisurkhan", "researchgate": "https://researchgate.net/profile/anisur-khan"}', TRUE, NOW() - INTERVAL 20 DAY),

(4, 'Nashid Chowdhury', 'nashid@oriyet.com', 'Data Scientist at Microsoft. Machine Learning and Big Data specialist. 10+ years of industry experience building scalable ML solutions for enterprise clients.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', 'https://linkedin.com/in/nashidchowdhury', '{"linkedin": "https://linkedin.com/in/nashidchowdhury", "kaggle": "https://kaggle.com/nashidchowdhury"}', TRUE, NOW() - INTERVAL 15 DAY),

(5, 'Farzana Islam', 'farzana@oriyet.com', 'UI/UX Designer and Product Manager. Expert in Figma and Adobe tools. Led design teams at top tech companies and helped launch 50+ successful products.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', 'https://linkedin.com/in/farzanaislam', '{"linkedin": "https://linkedin.com/in/farzanaislam", "dribbble": "https://dribbble.com/farzanaislam", "behance": "https://behance.net/farzanaislam"}', TRUE, NOW() - INTERVAL 10 DAY);

-- =============================================
-- EVENTS (Upcoming, Ongoing, Completed)
-- =============================================

-- Upcoming Free Seminar
INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, venue_details, online_link, online_platform, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, is_featured, is_published, created_by, created_at) VALUES
(1, 'Artificial Intelligence: Present and Future', 'artificial-intelligence-present-future', 
'A special seminar on the current state and future impact of Artificial Intelligence. Learn in-depth about ChatGPT, Machine Learning, and Neural Networks from industry experts.',
'<h2>About the Seminar</h2>
<p>Artificial Intelligence (AI) is the most discussed technology of our time. In this seminar, we will explore:</p>
<ul>
<li>Core concepts and history of AI</li>
<li>How Machine Learning works</li>
<li>ChatGPT and Large Language Models</li>
<li>AI opportunities in the global market</li>
<li>Career guidelines for AI professionals</li>
</ul>
<h2>Who Should Attend</h2>
<p>This seminar is perfect for AI enthusiasts, students, young professionals, and anyone interested in understanding the AI revolution.</p>',
'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop', 'seminar', 'hybrid',
'{"name": "Tech Convention Center", "address": "123 Innovation Drive, Silicon Valley, CA", "city": "San Francisco", "mapLink": "https://maps.google.com/?q=Tech+Convention+Center"}',
'https://meet.google.com/abc-defg-hij', 'google_meet',
DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY) + INTERVAL 3 HOUR,
DATE_ADD(NOW(), INTERVAL 6 DAY),
TRUE, 0.00, 200, 45, TRUE, 'open', 'upcoming', TRUE, TRUE, 1, NOW() - INTERVAL 10 DAY);

-- Upcoming Paid Workshop
INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, venue_details, online_link, online_platform, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, is_featured, is_published, created_by, created_at) VALUES
(2, 'React.js Masterclass: Zero to Hero', 'reactjs-masterclass-zero-to-hero',
'Complete hands-on React.js workshop. Learn React from A to Z through project-based learning methodology with real-world applications.',
'<h2>Workshop Curriculum</h2>
<h3>Day 1: React Fundamentals</h3>
<ul>
<li>What is React and why use it</li>
<li>Components, JSX, Props</li>
<li>State Management</li>
<li>Hooks: useState, useEffect</li>
</ul>
<h3>Day 2: Advanced Concepts</h3>
<ul>
<li>useContext, useReducer</li>
<li>Custom Hooks</li>
<li>React Router</li>
<li>API Integration</li>
</ul>
<h3>Day 3: Project Day</h3>
<ul>
<li>Full Project: Task Management App</li>
<li>Deployment to Vercel</li>
<li>Best Practices & Code Review</li>
</ul>
<h2>Prerequisites</h2>
<p>Basic knowledge of HTML, CSS, and JavaScript is required.</p>',
'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop', 'workshop', 'online',
NULL, 'https://zoom.us/j/1234567890', 'zoom',
DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY),
DATE_ADD(NOW(), INTERVAL 12 DAY),
FALSE, 1500.00, 50, 32, TRUE, 'open', 'upcoming', TRUE, TRUE, 1, NOW() - INTERVAL 7 DAY);

-- Upcoming Webinar
INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, online_link, online_platform, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, is_featured, is_published, created_by, created_at) VALUES
(3, 'Freelancing Career Guide 2025', 'freelancing-career-guide-2025',
'Complete guide to becoming a successful freelancer. Learn strategies to get clients on Upwork, Fiverr, and Freelancer.com from a proven expert.',
'<h2>Webinar Topics</h2>
<ul>
<li>What is freelancing and how to get started</li>
<li>Best marketplace platforms overview</li>
<li>Profile optimization techniques</li>
<li>Proposal writing strategies that win clients</li>
<li>Client management and communication</li>
<li>Payments, taxes, and financial planning</li>
</ul>
<h2>About the Speaker</h2>
<p>5+ years experienced freelancer who has earned $100k+ and helped hundreds of students start their freelancing journey.</p>',
'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop', 'webinar', 'online',
'https://meet.google.com/xyz-abcd-efg', 'google_meet',
DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY) + INTERVAL 2 HOUR,
DATE_ADD(NOW(), INTERVAL 4 DAY),
TRUE, 0.00, 500, 123, FALSE, 'open', 'upcoming', FALSE, TRUE, 1, NOW() - INTERVAL 5 DAY);

-- Ongoing Workshop
INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, online_link, online_platform, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, is_featured, is_published, created_by, created_at) VALUES
(4, 'Python for Data Science - Batch 3', 'python-data-science-batch-3',
'Learn Python for Data Science. Hands-on practice with Pandas, NumPy, Matplotlib, and Scikit-learn through real-world projects.',
'<h2>Course Content</h2>
<ul>
<li>Python Basics for Data Science</li>
<li>NumPy for Numerical Computing</li>
<li>Pandas for Data Manipulation</li>
<li>Data Visualization with Matplotlib & Seaborn</li>
<li>Introduction to Machine Learning</li>
<li>Real-world Projects & Case Studies</li>
</ul>',
'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop', 'workshop', 'online',
'https://zoom.us/j/9876543210', 'zoom',
DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY),
DATE_SUB(NOW(), INTERVAL 5 DAY),
FALSE, 2000.00, 40, 40, TRUE, 'full', 'ongoing', FALSE, TRUE, 1, NOW() - INTERVAL 15 DAY);

-- Completed Seminar 1
INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, venue_details, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, video_link, session_summary, is_featured, is_published, created_by, created_at) VALUES
(5, 'Cyber Security Awareness Seminar', 'cyber-security-awareness-seminar',
'Learn strategies to stay safe online. Discover how to protect yourself from hacking, phishing, and other cyber threats.',
'<h2>What Was Covered</h2>
<ul>
<li>Introduction to Cyber Threats</li>
<li>How to Identify Phishing Attacks</li>
<li>Creating Strong Passwords</li>
<li>Two-Factor Authentication Setup</li>
<li>Protecting Against Social Engineering</li>
</ul>',
'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=400&fit=crop', 'seminar', 'offline',
'{"name": "Innovation Hub Auditorium", "address": "456 Tech Park Avenue, Boston, MA", "city": "Boston"}',
DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY) + INTERVAL 3 HOUR,
DATE_SUB(NOW(), INTERVAL 12 DAY),
TRUE, 0.00, 150, 142, TRUE, 'closed', 'completed',
'https://youtube.com/watch?v=demo123',
'142 participants attended the seminar. Various aspects of cyber security were discussed with live demonstrations.',
FALSE, TRUE, 1, NOW() - INTERVAL 20 DAY);

-- Completed Workshop 2
INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, online_link, online_platform, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, video_link, session_summary, is_featured, is_published, created_by, created_at) VALUES
(6, 'UI/UX Design Fundamentals', 'ui-ux-design-fundamentals',
'Learn the basics of User Interface and User Experience design. Complete practical projects using Figma and industry-standard tools.',
'<h2>Workshop Content</h2>
<ul>
<li>UI vs UX: Differences and Importance</li>
<li>Design Principles & Best Practices</li>
<li>Color Theory & Typography</li>
<li>Figma Tools & Features</li>
<li>Wireframing & Prototyping</li>
<li>Hands-on Design Project</li>
</ul>',
'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=400&fit=crop', 'workshop', 'online',
'https://zoom.us/j/1111222233', 'zoom',
DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY),
DATE_SUB(NOW(), INTERVAL 10 DAY),
FALSE, 1200.00, 30, 28, TRUE, 'closed', 'completed',
'https://youtube.com/watch?v=demo456',
'28 participants successfully completed the workshop with portfolio-ready design projects.',
FALSE, TRUE, 1, NOW() - INTERVAL 25 DAY);

-- More Upcoming Events
INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, online_link, online_platform, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, is_featured, is_published, created_by, created_at) VALUES
(7, 'Node.js Backend Development', 'nodejs-backend-development',
'Learn professional backend development with Node.js. Master Express, MongoDB, Authentication, and deployment strategies.',
'<h2>Course Outline</h2>
<ul>
<li>Node.js Fundamentals</li>
<li>Express.js Framework</li>
<li>RESTful API Design</li>
<li>MongoDB with Mongoose</li>
<li>Authentication & Authorization</li>
<li>Deployment to Cloud Platforms</li>
</ul>',
'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop', 'workshop', 'online',
'https://zoom.us/j/4444555566', 'zoom',
DATE_ADD(NOW(), INTERVAL 21 DAY), DATE_ADD(NOW(), INTERVAL 23 DAY),
DATE_ADD(NOW(), INTERVAL 19 DAY),
FALSE, 1800.00, 35, 12, TRUE, 'open', 'upcoming', FALSE, TRUE, 1, NOW() - INTERVAL 3 DAY);

INSERT INTO events (id, title, slug, description, content, thumbnail, event_type, event_mode, venue_details, start_date, end_date, registration_deadline, is_free, price, max_participants, current_participants, has_certificate, registration_status, event_status, is_featured, is_published, created_by, created_at) VALUES
(8, 'Digital Marketing Summit 2025', 'digital-marketing-summit-2025',
'The biggest digital marketing conference of the year. Learn from industry experts and network with professionals.',
'<h2>Summit Highlights</h2>
<ul>
<li>SEO Trends 2025</li>
<li>Social Media Marketing Strategies</li>
<li>Content Marketing that Converts</li>
<li>Paid Advertising Optimization</li>
<li>Influencer Marketing Secrets</li>
<li>Analytics & Performance Reporting</li>
</ul>',
'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop', 'seminar', 'offline',
'{"name": "Grand Convention Center", "address": "789 Business District, New York, NY", "city": "New York"}',
DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY) + INTERVAL 8 HOUR,
DATE_ADD(NOW(), INTERVAL 25 DAY),
FALSE, 500.00, 300, 78, FALSE, 'open', 'upcoming', TRUE, TRUE, 1, NOW() - INTERVAL 5 DAY);

-- =============================================
-- EVENT HOSTS (Linking events with hosts)
-- =============================================
INSERT INTO event_hosts (event_id, host_id, role) VALUES
(1, 1, 'keynote_speaker'),
(1, 4, 'speaker'),
(2, 2, 'instructor'),
(3, 2, 'speaker'),
(4, 4, 'instructor'),
(5, 3, 'speaker'),
(6, 5, 'instructor'),
(7, 2, 'instructor'),
(8, 5, 'speaker');

-- =============================================
-- EVENT SESSIONS (For multi-day events)
-- =============================================
INSERT INTO event_sessions (event_id, title, description, start_time, end_time, speaker_name) VALUES
(2, 'React Fundamentals', 'Learn the basic concepts of React including components, JSX, and props', DATE_ADD(NOW(), INTERVAL 14 DAY) + INTERVAL 10 HOUR, DATE_ADD(NOW(), INTERVAL 14 DAY) + INTERVAL 14 HOUR, 'Eng. Sabrina Sultana'),
(2, 'Advanced React', 'Deep dive into advanced topics like context, reducers, and custom hooks', DATE_ADD(NOW(), INTERVAL 15 DAY) + INTERVAL 10 HOUR, DATE_ADD(NOW(), INTERVAL 15 DAY) + INTERVAL 14 HOUR, 'Eng. Sabrina Sultana'),
(2, 'Project Day', 'Build a complete practical project from scratch', DATE_ADD(NOW(), INTERVAL 16 DAY) + INTERVAL 10 HOUR, DATE_ADD(NOW(), INTERVAL 16 DAY) + INTERVAL 16 HOUR, 'Eng. Sabrina Sultana'),
(4, 'Python Basics', 'Introduction to Python programming fundamentals', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 18 HOUR, DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 20 HOUR, 'Nashid Chowdhury'),
(4, 'NumPy & Pandas', 'Data manipulation and analysis with NumPy and Pandas', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 18 HOUR, DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 20 HOUR, 'Nashid Chowdhury');

-- =============================================
-- EVENT REGISTRATIONS
-- =============================================

-- Registrations for Event 1 (AI Seminar - Upcoming)
INSERT INTO event_registrations (event_id, user_id, registration_number, status, payment_status, created_at) VALUES
(1, 2, 'REG-EVT1-001', 'confirmed', 'not_required', NOW() - INTERVAL 5 DAY),
(1, 3, 'REG-EVT1-002', 'confirmed', 'not_required', NOW() - INTERVAL 4 DAY),
(1, 4, 'REG-EVT1-003', 'confirmed', 'not_required', NOW() - INTERVAL 3 DAY),
(1, 5, 'REG-EVT1-004', 'pending', 'not_required', NOW() - INTERVAL 2 DAY);

-- Registrations for Event 2 (React Workshop - Upcoming Paid)
INSERT INTO event_registrations (event_id, user_id, registration_number, status, payment_status, payment_amount, created_at) VALUES
(2, 2, 'REG-EVT2-001', 'confirmed', 'completed', 1500.00, NOW() - INTERVAL 5 DAY),
(2, 3, 'REG-EVT2-002', 'confirmed', 'completed', 1500.00, NOW() - INTERVAL 4 DAY),
(2, 6, 'REG-EVT2-003', 'confirmed', 'completed', 1500.00, NOW() - INTERVAL 3 DAY),
(2, 7, 'REG-EVT2-004', 'pending', 'pending', 1500.00, NOW() - INTERVAL 1 DAY);

-- Registrations for Event 3 (Freelancing Webinar - Upcoming Free)
INSERT INTO event_registrations (event_id, user_id, registration_number, status, payment_status, created_at) VALUES
(3, 4, 'REG-EVT3-001', 'confirmed', 'not_required', NOW() - INTERVAL 3 DAY),
(3, 5, 'REG-EVT3-002', 'confirmed', 'not_required', NOW() - INTERVAL 2 DAY),
(3, 8, 'REG-EVT3-003', 'confirmed', 'not_required', NOW() - INTERVAL 1 DAY);

-- Registrations for Event 4 (Python DS - Ongoing/Full)
INSERT INTO event_registrations (event_id, user_id, registration_number, status, payment_status, payment_amount, created_at) VALUES
(4, 2, 'REG-EVT4-001', 'attended', 'completed', 2000.00, NOW() - INTERVAL 10 DAY),
(4, 3, 'REG-EVT4-002', 'attended', 'completed', 2000.00, NOW() - INTERVAL 10 DAY),
(4, 4, 'REG-EVT4-003', 'attended', 'completed', 2000.00, NOW() - INTERVAL 9 DAY),
(4, 6, 'REG-EVT4-004', 'confirmed', 'completed', 2000.00, NOW() - INTERVAL 8 DAY);

-- Registrations for Event 5 (Cyber Security - Completed)
INSERT INTO event_registrations (event_id, user_id, registration_number, status, payment_status, attendance_marked_at, created_at) VALUES
(5, 2, 'REG-EVT5-001', 'attended', 'not_required', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW() - INTERVAL 15 DAY),
(5, 3, 'REG-EVT5-002', 'attended', 'not_required', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW() - INTERVAL 14 DAY),
(5, 4, 'REG-EVT5-003', 'attended', 'not_required', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW() - INTERVAL 14 DAY),
(5, 5, 'REG-EVT5-004', 'attended', 'not_required', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW() - INTERVAL 13 DAY),
(5, 6, 'REG-EVT5-005', 'attended', 'not_required', DATE_SUB(NOW(), INTERVAL 10 DAY), NOW() - INTERVAL 13 DAY);

-- Registrations for Event 6 (UI/UX - Completed)
INSERT INTO event_registrations (event_id, user_id, registration_number, status, payment_status, payment_amount, attendance_marked_at, created_at) VALUES
(6, 3, 'REG-EVT6-001', 'attended', 'completed', 1200.00, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW() - INTERVAL 15 DAY),
(6, 5, 'REG-EVT6-002', 'attended', 'completed', 1200.00, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW() - INTERVAL 14 DAY),
(6, 7, 'REG-EVT6-003', 'attended', 'completed', 1200.00, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW() - INTERVAL 13 DAY),
(6, 9, 'REG-EVT6-004', 'attended', 'completed', 1200.00, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW() - INTERVAL 12 DAY);

-- =============================================
-- PAYMENT TRANSACTIONS
-- =============================================
INSERT INTO payment_transactions (registration_id, user_id, transaction_id, invoice_id, amount, payment_method, gateway, status, paid_at, created_at) VALUES
-- React Workshop Payments
(5, 2, 'TRX-20251220-001', 'INV-001', 1500.00, 'bkash', 'uddoktapay', 'completed', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
(6, 3, 'TRX-20251220-002', 'INV-002', 1500.00, 'nagad', 'uddoktapay', 'completed', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 4 DAY),
(7, 6, 'TRX-20251221-001', 'INV-003', 1500.00, 'rocket', 'uddoktapay', 'completed', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY),
(8, 7, 'TRX-20251222-001', 'INV-004', 1500.00, 'bkash', 'uddoktapay', 'pending', NULL, NOW() - INTERVAL 1 DAY),

-- Python DS Payments
(12, 2, 'TRX-20251215-001', 'INV-005', 2000.00, 'bkash', 'uddoktapay', 'completed', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
(13, 3, 'TRX-20251215-002', 'INV-006', 2000.00, 'nagad', 'uddoktapay', 'completed', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 10 DAY),
(14, 4, 'TRX-20251216-001', 'INV-007', 2000.00, 'bkash', 'uddoktapay', 'completed', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY),
(15, 6, 'TRX-20251217-001', 'INV-008', 2000.00, 'rocket', 'uddoktapay', 'completed', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),

-- UI/UX Workshop Payments
(21, 3, 'TRX-20251210-001', 'INV-009', 1200.00, 'bkash', 'uddoktapay', 'completed', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 15 DAY),
(22, 5, 'TRX-20251211-001', 'INV-010', 1200.00, 'nagad', 'uddoktapay', 'completed', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 14 DAY),
(23, 7, 'TRX-20251212-001', 'INV-011', 1200.00, 'bkash', 'uddoktapay', 'completed', NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 13 DAY),
(24, 9, 'TRX-20251213-001', 'INV-012', 1200.00, 'rocket', 'uddoktapay', 'completed', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 12 DAY);

-- =============================================
-- CERTIFICATES (For completed events)
-- =============================================
INSERT INTO certificates (certificate_id, registration_id, user_id, event_id, certificate_url, qr_code_data, issued_at, verification_count) VALUES
-- Cyber Security Seminar Certificates
('CERT-2024-CS-001', 16, 2, 5, '/uploads/certificates/CERT-2024-CS-001.pdf', 'https://oriyet.com/verify/CERT-2024-CS-001', NOW() - INTERVAL 9 DAY, 3),
('CERT-2024-CS-002', 17, 3, 5, '/uploads/certificates/CERT-2024-CS-002.pdf', 'https://oriyet.com/verify/CERT-2024-CS-002', NOW() - INTERVAL 9 DAY, 1),
('CERT-2024-CS-003', 18, 4, 5, '/uploads/certificates/CERT-2024-CS-003.pdf', 'https://oriyet.com/verify/CERT-2024-CS-003', NOW() - INTERVAL 9 DAY, 2),
('CERT-2024-CS-004', 19, 5, 5, '/uploads/certificates/CERT-2024-CS-004.pdf', 'https://oriyet.com/verify/CERT-2024-CS-004', NOW() - INTERVAL 9 DAY, 0),
('CERT-2024-CS-005', 20, 6, 5, '/uploads/certificates/CERT-2024-CS-005.pdf', 'https://oriyet.com/verify/CERT-2024-CS-005', NOW() - INTERVAL 9 DAY, 1),

-- UI/UX Workshop Certificates
('CERT-2024-UX-001', 21, 3, 6, '/uploads/certificates/CERT-2024-UX-001.pdf', 'https://oriyet.com/verify/CERT-2024-UX-001', NOW() - INTERVAL 4 DAY, 2),
('CERT-2024-UX-002', 22, 5, 6, '/uploads/certificates/CERT-2024-UX-002.pdf', 'https://oriyet.com/verify/CERT-2024-UX-002', NOW() - INTERVAL 4 DAY, 1),
('CERT-2024-UX-003', 23, 7, 6, '/uploads/certificates/CERT-2024-UX-003.pdf', 'https://oriyet.com/verify/CERT-2024-UX-003', NOW() - INTERVAL 4 DAY, 0),
('CERT-2024-UX-004', 24, 9, 6, '/uploads/certificates/CERT-2024-UX-004.pdf', 'https://oriyet.com/verify/CERT-2024-UX-004', NOW() - INTERVAL 4 DAY, 1);

-- =============================================
-- CERTIFICATE VERIFICATIONS (Log)
-- =============================================
INSERT INTO certificate_verifications (certificate_id, verified_at, ip_address, user_agent) VALUES
(1, NOW() - INTERVAL 8 DAY, '103.145.23.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(1, NOW() - INTERVAL 5 DAY, '103.145.23.46', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)'),
(1, NOW() - INTERVAL 2 DAY, '103.145.23.47', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(2, NOW() - INTERVAL 7 DAY, '45.123.45.67', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(3, NOW() - INTERVAL 6 DAY, '192.168.1.1', 'Mozilla/5.0 (Android 12; Mobile)'),
(3, NOW() - INTERVAL 3 DAY, '192.168.1.2', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(5, NOW() - INTERVAL 4 DAY, '103.145.23.48', 'Mozilla/5.0 (Linux; Android 11)'),
(6, NOW() - INTERVAL 3 DAY, '103.145.23.49', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
(6, NOW() - INTERVAL 1 DAY, '103.145.23.50', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)'),
(7, NOW() - INTERVAL 2 DAY, '45.123.45.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
(9, NOW() - INTERVAL 1 DAY, '192.168.1.3', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

-- =============================================
-- BLOG POSTS
-- =============================================
INSERT INTO blog_posts (id, title, slug, excerpt, content, thumbnail, author_id, status, tags, views, published_at, created_at) VALUES
(1, 'Top 5 Resources to Learn Programming', 'best-5-resources-to-learn-programming',
'Want to learn programming? These 5 free resources will help you master coding from scratch.',
'<h2>Introduction</h2>
<p>Learning to program is no longer difficult. There are countless free resources on the internet that allow you to learn programming from the comfort of your home.</p>

<h2>1. freeCodeCamp</h2>
<p>freeCodeCamp is the most popular free coding platform. Here you can learn everything from HTML, CSS, JavaScript to Python and Data Science with hands-on projects.</p>

<h2>2. The Odin Project</h2>
<p>An excellent project-based curriculum for learning web development. Build real projects while learning the fundamentals.</p>

<h2>3. CS50 by Harvard</h2>
<p>This course from Harvard University is the best for learning the fundamentals of computer science. It covers algorithms, data structures, and more.</p>

<h2>4. Codecademy</h2>
<p>A great platform for interactive coding lessons. Learn by doing with instant feedback on your code.</p>

<h2>5. YouTube Channels</h2>
<p>Traversy Media, The Net Ninja, Programming with Mosh - you can learn a lot for free from these channels with high-quality tutorials.</p>

<h2>Conclusion</h2>
<p>Start today! There are no excuses. Pick one resource and begin your coding journey now.</p>',
'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop', 1, 'published',
'["programming", "resources", "learning", "beginner"]',
1250, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 22 DAY),

(2, 'Things to Know Before Starting Freelancing', 'things-to-know-before-starting-freelancing',
'Want to start freelancing? Learn these essential things first before taking the leap.',
'<h2>Is Freelancing for Everyone?</h2>
<p>Freelancing is a challenging career path. There are some things you need to know before getting started.</p>

<h2>Skill Development</h2>
<p>First, learn a marketable skill. Web Development, Graphic Design, Content Writing, Video Editing - learn any one of them thoroughly before starting.</p>

<h2>Building a Portfolio</h2>
<p>You need a portfolio to get work. Start by doing some demo projects. Showcase your best work even if they are personal projects.</p>

<h2>Writing Proposals</h2>
<p>Writing good proposals is an art. Understand the client''s problem and propose a solution. Personalize each proposal for better results.</p>

<h2>Be Patient</h2>
<p>Getting the first client takes time. Don''t give up. Consistency and persistence are key to freelancing success.</p>',
'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=400&fit=crop', 1, 'published',
'["freelancing", "career", "tips", "beginner"]',
890, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 18 DAY),

(3, 'Skills to Learn in the AI Era', 'skills-to-learn-in-ai-era',
'Which skills will keep you ahead in the age of Artificial Intelligence? Find out here.',
'<h2>AI is Bringing Change</h2>
<p>ChatGPT, Midjourney, Claude - AI tools are advancing rapidly. However, some human skills remain indispensable and will continue to be valuable.</p>

<h2>Critical Thinking</h2>
<p>Critical thinking is essential to use AI correctly. You need to evaluate AI outputs and make informed decisions.</p>

<h2>Prompt Engineering</h2>
<p>Learn to write the right prompts to get good output from AI. This skill is becoming increasingly valuable in the job market.</p>

<h2>Data Analysis</h2>
<p>Being able to understand and analyze data is crucial. AI can process data, but humans need to interpret the insights.</p>

<h2>Soft Skills</h2>
<p>Communication, leadership, teamwork - AI cannot replace these. These skills will remain valuable regardless of technological advances.</p>',
'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop', 1, 'published',
'["ai", "skills", "future", "career"]',
2100, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 12 DAY),

(4, 'The Future of the Tech Industry', 'future-of-tech-industry',
'Where is the tech sector heading? Explore the opportunities and challenges ahead.',
'<h2>Current State</h2>
<p>The global IT sector is growing rapidly. Software exports have crossed billions of dollars and the industry continues to expand year over year.</p>

<h2>Promising Areas</h2>
<ul>
<li>Fintech - Revolutionizing financial services</li>
<li>EdTech - Transforming education globally</li>
<li>HealthTech - Improving healthcare delivery</li>
<li>E-commerce - Changing retail landscape</li>
<li>AI & ML Solutions - Automating everything</li>
</ul>

<h2>Challenges</h2>
<p>Shortage of skilled manpower and infrastructure issues remain significant challenges that need to be addressed.</p>

<h2>What Should Be Done</h2>
<p>Quality education and industry-academia collaboration need to increase to prepare the workforce for future opportunities.</p>',
'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop', 1, 'published',
'["tech", "industry", "future", "trends"]',
1560, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 7 DAY),

(5, 'Productivity Tips for Remote Work', 'productivity-tips-for-remote-work',
'Working from home? Here''s how to stay productive and maintain work-life balance.',
'<h2>Remote Work Challenges</h2>
<p>Working from home may seem easy, but there are many challenges. Staying focused can be difficult with distractions all around.</p>

<h2>Dedicated Workspace</h2>
<p>Keep a separate space just for work. This helps create a mental boundary between work and personal life.</p>

<h2>Time Blocking</h2>
<p>Allocate specific times of the day for specific tasks. This technique helps maintain focus and increases productivity.</p>

<h2>Take Breaks</h2>
<p>Use the Pomodoro Technique. Work for 25 minutes, take a 5-minute break. This prevents burnout and keeps you fresh.</p>

<h2>Maintain Health</h2>
<p>Exercise regularly. Maintain a sleep routine. Your physical health directly impacts your productivity and mental well-being.</p>',
'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=800&h=400&fit=crop', 1, 'draft',
'["remote-work", "productivity", "tips", "work-from-home"]',
0, NULL, NOW() - INTERVAL 2 DAY);

-- =============================================
-- Update Event Participant Counts (based on registrations)
-- =============================================
UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = 1 AND status IN ('confirmed', 'attended')) WHERE id = 1;
UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = 2 AND status IN ('confirmed', 'attended')) WHERE id = 2;
UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = 3 AND status IN ('confirmed', 'attended')) WHERE id = 3;
UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = 4 AND status IN ('confirmed', 'attended')) WHERE id = 4;
UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = 5 AND status IN ('confirmed', 'attended')) WHERE id = 5;
UPDATE events SET current_participants = (SELECT COUNT(*) FROM event_registrations WHERE event_id = 6 AND status IN ('confirmed', 'attended')) WHERE id = 6;

-- =============================================
-- SUMMARY
-- =============================================
-- Users: 10 (1 Admin + 9 Regular Users)
-- Hosts: 5
-- Events: 8 (4 Upcoming, 1 Ongoing, 2 Completed, 1 More Upcoming)
-- Registrations: 24
-- Payments: 12
-- Certificates: 9
-- Blog Posts: 5 (4 Published, 1 Draft)
--
-- Login Credentials:
-- Admin: admin@oriyet.com / Password@123
-- Users: rafiq@example.com, fatima@example.com, etc. / Password@123
-- =============================================

SELECT 'Demo data seeded successfully!' AS status;
SELECT CONCAT('Users: ', COUNT(*)) AS count FROM users;
SELECT CONCAT('Hosts: ', COUNT(*)) AS count FROM hosts;
SELECT CONCAT('Events: ', COUNT(*)) AS count FROM events;
SELECT CONCAT('Registrations: ', COUNT(*)) AS count FROM event_registrations;
SELECT CONCAT('Payments: ', COUNT(*)) AS count FROM payment_transactions;
SELECT CONCAT('Certificates: ', COUNT(*)) AS count FROM certificates;
SELECT CONCAT('Blog Posts: ', COUNT(*)) AS count FROM blog_posts;
