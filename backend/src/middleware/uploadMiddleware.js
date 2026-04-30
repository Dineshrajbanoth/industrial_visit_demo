const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

// MIME types accepted for document uploads
const allowedDocumentTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-mspowerpoint',  // PowerPoint variant (Safari/Firefox)
  'application/mspowerpoint',     // PowerPoint variant (Windows)
  'text/plain',
]);

// File extensions to accept as fallback validation
const allowedExtensions = new Set(['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt']);

function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

function isAllowedImage(mimetype) {
  return mimetype && mimetype.startsWith('image/');
}

function isAllowedDocument(mimetype, filename) {
  // First check: MIME type in whitelist
  if (mimetype && allowedDocumentTypes.has(mimetype)) {
    return true;
  }

  // Fallback: Check file extension if MIME type not recognized
  const ext = getFileExtension(filename);
  if (allowedExtensions.has(ext)) {
    return true;
  }

  return false;
}

const fileFilter = (req, file, cb) => {
  // Allow all image types
  if (isAllowedImage(file.mimetype)) {
    return cb(null, true);
  }

  // Allow specific document types
  if (isAllowedDocument(file.mimetype, file.originalname)) {
    return cb(null, true);
  }

  // Reject with detailed error message
  const errorMsg = `Unsupported file type: ${file.originalname}. Supported: images, pdf, docx, pptx, txt. Received: ${file.mimetype}`;
  cb(new Error(errorMsg), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { upload };
