import { body } from 'express-validator';

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Please enter your full name')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, apostrophes and dashes'),
  body('email')
    .trim()

    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address (e.g., name@example.com)')
    .custom((value) => {
      // Additional email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Email format is invalid');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      // Check for uppercase letter
      if (!/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter (A-Z)');
      }

      // Check for lowercase letter
      if (!/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter (a-z)');
      }

      // Check for number
      if (!/\d/.test(value)) {
        throw new Error('Password must contain at least one number (0-9)');
      }

      // Check for special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        throw new Error('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
      }

      return true;
    }),
  body('phone')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true; // Optional field

      // Remove all spaces, dashes, and parentheses for validation
      const cleanedPhone = value.replace(/[\s\-()]/g, '');

      // Must start with + and have 7-15 digits after country code
      // Supports all international formats:
      // - Short country codes: +1, +44, +91, etc. (1-3 digits)
      // - Various number lengths: 7-15 digits total
      const phoneRegex = /^\+\d{7,15}$/;

      if (!phoneRegex.test(cleanedPhone)) {
        throw new Error('Phone number must include country code (e.g., +880 1712-345678)');
      }

      return true;
    }),
];

export const loginValidation = [
  body('email')
    .trim()

    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const verifyEmailValidation = [
  body('email')
    .trim()

    .isEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
];

export const resendOTPValidation = [
  body('email')
    .trim()

    .isEmail()
    .withMessage('Please provide a valid email'),
];

export const googleAuthValidation = [
  body('idToken')
    .notEmpty()
    .withMessage('Google ID token is required'),
];

export const googleAuthCallbackValidation = [
  body('code')
    .notEmpty()
    .withMessage('Authorization code is required'),
  body('redirectUri')
    .notEmpty()
    .withMessage('Redirect URI is required'),
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
];

export const forgotPasswordValidation = [
  body('email')
    .trim()

    .isEmail()
    .withMessage('Please provide a valid email'),
];

export const resetPasswordValidation = [
  body('email')
    .trim()

    .isEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (!/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter (A-Z)');
      }
      if (!/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter (a-z)');
      }
      if (!/\d/.test(value)) {
        throw new Error('Password must contain at least one number (0-9)');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        throw new Error('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
      }
      return true;
    }),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (!/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter (A-Z)');
      }
      if (!/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter (a-z)');
      }
      if (!/\d/.test(value)) {
        throw new Error('Password must contain at least one number (0-9)');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        throw new Error('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
      }
      return true;
    }),
];

export const verifyAndChangePasswordValidation = [
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .custom((value) => {
      if (!/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter (A-Z)');
      }
      if (!/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter (a-z)');
      }
      if (!/\d/.test(value)) {
        throw new Error('Password must contain at least one number (0-9)');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        throw new Error('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
      }
      return true;
    }),
];
