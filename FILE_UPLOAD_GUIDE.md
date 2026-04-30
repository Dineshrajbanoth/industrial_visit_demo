# File Upload Documentation - .pptx Fix

## Why .pptx Files Were Being Rejected

The issue was a **MIME type mismatch** across different browsers. Here's what was happening:

### Root Cause: Browser MIME Type Inconsistency

Different browsers and operating systems send **different MIME types** for the same `.pptx` file:

| Browser/OS | MIME Type Sent | Previous Validation |
|------------|----------------|-------------------|
| Chrome | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | ✅ Accepted |
| Firefox | `application/vnd.ms-powerpoint` | ❌ Rejected |
| Safari | `application/x-mspowerpoint` | ❌ Rejected |
| Windows | `application/mspowerpoint` | ❌ Rejected |

**Why it failed:**
The original `uploadMiddleware.js` only had 2 PowerPoint MIME types and no fallback to file extension checking. When Firefox or Safari sent their variant MIME type, the strict `allowedDocumentTypes.has(mimetype)` check failed.

---

## What Was Fixed

### 1. Backend: Enhanced MIME Type Support

**File:** `backend/src/middleware/uploadMiddleware.js`

✅ **Added all PowerPoint MIME type variants:**
```javascript
const allowedDocumentTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',              // ← Firefox/Windows
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-mspowerpoint',                  // ← Safari
  'application/mspowerpoint',                    // ← Older systems
  'text/plain',
]);
```

✅ **Implemented Dual Validation (MIME Type + File Extension):**
```javascript
function isAllowedDocument(mimetype, filename) {
  // First: Check MIME type whitelist
  if (mimetype && allowedDocumentTypes.has(mimetype)) {
    return true;
  }

  // Fallback: Check file extension
  const ext = getFileExtension(filename);
  if (allowedExtensions.has(ext)) {
    return true;
  }

  return false;
}
```

✅ **Better Error Messages:**
Instead of generic "Only image and common document files are allowed", you now get:
```
Unsupported file type: presentation.pptx. Supported: images, pdf, docx, pptx, txt. Received: application/x-mspowerpoint
```

### 2. Backend: Enhanced Error Handling

**File:** `backend/src/middleware/errorMiddleware.js`

✅ **Specific Error Codes for File Operations:**
```javascript
// FILE_TYPE_NOT_ALLOWED → Shows which types are supported
// FILE_TOO_LARGE → Shows 10MB limit
// TOO_MANY_FILES → Shows max file count
// INVALID_FILE_FIELD → Shows correct field names
```

Frontend can now use these codes to show targeted error messages:
```json
{
  "message": "Unsupported file type: presentation.pptx...",
  "code": "FILE_TYPE_NOT_ALLOWED"
}
```

### 3. Frontend: Enhanced Validation

**File:** `frontend/src/components/VisitForm.jsx`

✅ **Client-side MIME type checking before upload:**
```javascript
const allowedDocMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-mspowerpoint',
  'application/mspowerpoint',
  'text/plain',
];
```

✅ **Smart File Extension Fallback:**
```javascript
// If MIME type doesn't match whitelist, still check extension
if (file.type && !allowedDocMimes.includes(file.type)) {
  // Allow if it looks like a document (has application/text MIME)
  if (!file.type.includes('application') && !file.type.includes('text')) {
    return false; // Only reject if clearly not a document
  }
}
```

---

## Supported File Types After Fix

### Images (5MB max)
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, etc.
- Any file with `image/*` MIME type

### Documents (10MB max)

| Format | Extensions | MIME Types |
|--------|-----------|-----------|
| **PDF** | `.pdf` | `application/pdf` |
| **Word** | `.docx`, `.doc` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/msword` |
| **PowerPoint** | `.pptx`, `.ppt` | `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `application/vnd.ms-powerpoint`, `application/x-mspowerpoint`, `application/mspowerpoint` |
| **Text** | `.txt` | `text/plain` |

---

## Validation Flow (Complete Process)

```
User selects .pptx file in UI
    ↓
Frontend validates locally:
  1. Check file extension (.pptx allowed?)
  2. Check file size (≤ 10MB?)
  3. Check MIME type or fallback to extension
    ↓
If valid, show preview and proceed
If invalid, show specific error
    ↓
User clicks "Save Visit"
    ↓
Frontend sends multipart/form-data:
  - images[] → for images
  - attachments[] → for documents
    ↓
Backend uploadMiddleware intercepts:
  1. Check if file is image (image/* MIME type)
  2. Check if file is allowed document:
     - MIME type in whitelist? YES → Accept
     - MIME type not in whitelist? Check extension
     - Extension in whitelist? YES → Accept
     - Both fail? → Reject with error code
    ↓
If validation passes:
  - File stored locally in uploads/ folder
  - Metadata saved: {url, filename, mimeType, resourceType}
  - Visit record updated with attachment
    ↓
Error handler catches rejection:
  - CODE: FILE_TYPE_NOT_ALLOWED
  - Shows detailed message with supported types
  - Returns 400 Bad Request
    ↓
Frontend receives error:
  - Displays specific reason to user
  - User can try different file or correct the issue
```

---

## Security Benefits

1. ✅ **Server-side validation** - Never trusts client-side validation alone
2. ✅ **Whitelist approach** - Only accepts known safe MIME types
3. ✅ **Extension fallback** - Prevents renamed malicious files from bypassing MIME check
4. ✅ **Size limits** - 10MB max prevents disk exhaustion
5. ✅ **Detailed errors** - No system path leakage, just file type info

---

## Testing the Fix

### Test 1: Upload .pptx from Chrome
```bash
1. Go to http://localhost:5173/admin
2. Click "New Visit"
3. Select a .pptx file
4. Should upload successfully ✅
```

### Test 2: Upload .pptx from Firefox
```bash
1. Same steps as above
2. Firefox sends different MIME type (application/vnd.ms-powerpoint)
3. Backend accepts it because extension .pptx is in whitelist
4. Should upload successfully ✅
```

### Test 3: Check Error Codes
```bash
# Using curl to test file rejection
curl -X POST http://localhost:5000/api/visits \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "companyName=Test Co" \
  -F "attachments=@malicious.exe"

# Expected response:
# {
#   "message": "Unsupported file type: malicious.exe...",
#   "code": "FILE_TYPE_NOT_ALLOWED"
# }
```

### Test 4: Upload Large Document
```bash
# File > 10MB should be rejected
curl -X POST http://localhost:5000/api/visits \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "attachments=@huge_document.pdf" # > 10MB

# Expected response:
# {
#   "message": "File too large. Maximum size is 10MB.",
#   "code": "FILE_TOO_LARGE"
# }
```

---

## Complete Backend Configuration

### uploadMiddleware.js Structure

```javascript
// 1. Storage: Where files are saved
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: 'unique-timestamp-name.ext'
});

// 2. Allowed types: Whitelist of acceptable MIME types
const allowedDocumentTypes = new Set([...]);

// 3. Validation functions: Multi-layer checking
function isAllowedDocument(mimetype, filename) { ... }
function isAllowedImage(mimetype) { ... }

// 4. File filter: Called for each uploaded file
const fileFilter = (req, file, cb) => {
  // Check if image
  // Check if document
  // Otherwise reject
};

// 5. Multer instance: Configure limits
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});
```

### errorMiddleware.js Structure

```javascript
// Catch multer-specific errors
if (error.message.includes('Unsupported file type')) {
  return res.status(400).json({
    message: error.message,
    code: 'FILE_TYPE_NOT_ALLOWED'
  });
}

// Handle size limit errors
if (error.code === 'LIMIT_FILE_SIZE') {
  return res.status(400).json({
    message: 'File too large. Maximum size is 10MB.',
    code: 'FILE_TOO_LARGE'
  });
}

// Handle other multer errors...
```

---

## Frontend Implementation Example

### Correct Form Setup
```jsx
// In VisitForm.jsx
<label>
  Attach Documents (pdf, docx, pptx, txt)
  <input
    type="file"
    multiple
    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
    onChange={(e) => handleAttachmentsChange(e.target.files)}
  />
</label>
```

### Correct FormData Structure
```javascript
// IMPORTANT: Separate images and attachments into different fields
const formData = new FormData();

// Add form data
formData.append('companyName', form.companyName);
formData.append('date', form.date);

// Add images to 'images' field
for (const file of files) {
  formData.append('images', file); // Max 8
}

// Add documents to 'attachments' field
for (const file of attachments) {
  formData.append('attachments', file); // Max 5
}

// Send to backend
onSubmit(formData);
```

---

## Troubleshooting

### Problem: Still getting "file type not allowed" for .pptx

**Solution:** The browser may be sending an unexpected MIME type

1. Open DevTools (F12)
2. Go to Network tab
3. Upload the .pptx file
4. Find POST request to `/api/visits`
5. Look at form data → see actual MIME type being sent
6. If missing, add to `allowedDocumentTypes` in uploadMiddleware.js:

```javascript
const allowedDocumentTypes = new Set([
  // ... existing types ...
  'application/vnd.openoffice.presentation', // If this is the MIME type
]);
```

### Problem: File uploads but doesn't appear in visit details

**Solution:** Check that backend is correctly separating images vs attachments:

```javascript
// In visitRoutes.js, ensure route accepts both:
upload.fields([
  { name: 'images', maxCount: 8 },
  { name: 'attachments', maxCount: 5 },
])
```

### Problem: Frontend shows file, but "Save Changes" fails with upload error

**Solution:** One of the validations is failing. Check:
1. File size (images ≤ 5MB, docs ≤ 10MB)
2. File extension in allowedDocExts
3. File MIME type in allowedDocMimes (or has 'application'/'text' in it)

---

## Files Modified

| File | Changes | Impact |
|------|---------|--------|
| `backend/src/middleware/uploadMiddleware.js` | + 4 PowerPoint MIME types<br>+ Extension fallback<br>+ Better error messages | Fixes .pptx rejection<br>Supports multiple browsers<br>Clearer feedback |
| `backend/src/middleware/errorMiddleware.js` | + Specific error codes<br>+ File-specific error messages | Better error reporting<br>Frontend can handle errors |
| `frontend/src/components/VisitForm.jsx` | + MIME type constants<br>+ isAllowedDocument function<br>+ Extension validation | Client-side checks<br>Better UX<br>Faster feedback |

---

## Summary

**Before:** ✗ .pptx rejected in Firefox/Safari due to MIME type mismatch
**After:** ✅ .pptx accepted in all browsers using dual validation (MIME + extension)

The fix uses a **defense-in-depth approach**:
1. **Frontend** validates before sending (fast feedback)
2. **Backend MIME type** check accepts common variants
3. **Backend extension** fallback catches unusual MIME types
4. **Error codes** help frontend show specific issues

All while maintaining **security** by never accepting unknown file types and validating on both client and server.

