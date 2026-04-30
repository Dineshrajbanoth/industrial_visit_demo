function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  // Handle multer file validation errors
  if (error && error.message && error.message.includes('Unsupported file type')) {
    return res.status(400).json({
      message: error.message,
      code: 'FILE_TYPE_NOT_ALLOWED',
    });
  }

  // Handle file size limit errors
  if (error && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File too large. Maximum size is 10MB.',
      code: 'FILE_TOO_LARGE',
    });
  }

  // Handle too many files
  if (error && error.code === 'LIMIT_PART_COUNT') {
    return res.status(400).json({
      message: 'Too many file parts. Maximum is 20.',
      code: 'TOO_MANY_FILES',
    });
  }

  // Handle unexpected field errors
  if (error && error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: `Unexpected file field: ${error.field}. Use 'images' or 'attachments'.`,
      code: 'INVALID_FILE_FIELD',
    });
  }

  // Default error handling
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
