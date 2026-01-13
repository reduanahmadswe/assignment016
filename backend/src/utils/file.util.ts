import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload directory path (Lazy creation used in storage)
const uploadDir = path.join(__dirname, '../../', env.upload.dir);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'documents';
    if (file.fieldname === 'avatar') {
      folder = 'avatars';
    } else if (file.mimetype.startsWith('image/')) {
      folder = 'images';
    }

    // Lazy creation: Create directory only when uploading
    const targetDir = path.join(uploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

// Image filter
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

// Multer upload configurations
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSize,
  },
});

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
  },
});

// Delete file utility
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const fullPath = path.join(uploadDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file URL
export const getFileUrl = (filename: string, folder: string = 'documents'): string => {
  return `/uploads/${folder}/${filename}`;
};

// Check if file exists
export const fileExists = (filePath: string): boolean => {
  const fullPath = path.join(uploadDir, filePath);
  return fs.existsSync(fullPath);
};

// Get full file path
export const getFullPath = (filename: string, folder: string = 'documents'): string => {
  return path.join(uploadDir, folder, filename);
};
