import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const env = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  // Database
  db: {
    host: process.env.DB_HOST || 'svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com',
    port: parseInt(process.env.DB_PORT || '3333'),
    user: process.env.DB_USER || 'aws-c370e',
    password: process.env.DB_PASSWORD || 'v8n8wN_zp3x~j9Hd~*Tw(3@xf',
    name: process.env.DB_NAME || 'db_aws_b6702',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  },

  // Email
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'ORIYET <noreply@oriyet.com>',
  },

  // UddoktaPay
  uddoktapay: {
    apiKey: process.env.UDDOKTAPAY_API_KEY || '982d381360a69d419689740d9f2e26ce36fb7a50',
    apiUrl: process.env.UDDOKTAPAY_API_URL || 'https://sandbox.uddoktapay.com/api/checkout-v2',
    verifyUrl: process.env.UDDOKTAPAY_VERIFY_URL || 'https://sandbox.uddoktapay.com/api/verify-payment',
  },

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  // Certificate
  certificateBaseUrl: process.env.CERTIFICATE_BASE_URL || 'http://localhost:3000/verify',

  // Timezone
  timezone: process.env.TIMEZONE || 'Asia/Dhaka',
};

export default env;
