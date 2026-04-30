Features added — April 30, 2026

1) Student authentication
- Endpoints:
  - POST /api/auth/student-register — register with rollNo, branch, section, password, optional name/email
  - POST /api/auth/student-login — login with password (preferred) or legacy rollNo+branch+section
- Tokens: JWT tokens issued on register/login and used by frontend `AuthContext`.

2) Visit attachments
- API: Visit create/update now accept multipart fields:
  - `images` — image files (same as before)
  - `attachments` — document files (pdf, doc, docx, pptx, txt)
- Storage: Uploads go to Cloudinary when configured; otherwise saved under local `uploads/` folder.
- Visit model: `Visit.attachments` stores objects `{ url, filename, mimeType }`.
- Frontend: `VisitForm` allows selecting attachments and previews (images show thumbnails; documents show filename and size). `VisitDetailsPage` and admin list show attachments with download links.

3) Client-side limits and validation
- Images: max 5 MB per file.
- Documents: max 10 MB per file.
- Invalid files are rejected client-side with a visible error message.

Notes for developers
- To enable Cloudinary, set Cloudinary credentials in environment and the backend will use it automatically.
- When testing locally, uploaded files will be placed under `uploads/` and served statically by the backend.
- Deleting an attachment removes the file (Cloudinary or local file) and updates the `Visit` record.
