// File: backend/smbRouter.ts
import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// SMB mount path (already mounted to backend container)
const SHARED_DIR = '/mnt/shared';

// List files and folders in a given directory
router.get('/files', (req, res) => {
  const dir = req.query.path as string || '';
  const targetPath = path.join(SHARED_DIR, dir);

  fs.readdir(targetPath, { withFileTypes: true }, (err, entries) => {
    if (err) return res.status(500).json({ error: err.message });

    const result = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'folder' : 'file'
    }));
    res.json(result);
  });
});

// Upload a file to the shared path
router.post('/upload', upload.single('file'), (req, res) => {
  const destPath = req.body.path || ''; // relative path in shared folder
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const targetFile = path.join(SHARED_DIR, destPath, file.originalname);
  fs.rename(file.path, targetFile, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, path: targetFile });
  });
});

// Download a file
router.get('/download', (req, res) => {
  const filePath = req.query.path as string;
  if (!filePath) return res.status(400).json({ error: 'Missing file path' });

  const absPath = path.join(SHARED_DIR, filePath);
  res.download(absPath);
});

// Delete a file
router.delete('/file', (req, res) => {
  const filePath = req.body.path;
  const absPath = path.join(SHARED_DIR, filePath);
  fs.unlink(absPath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

export default router;

