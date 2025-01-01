import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Set up multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'public/uploads');
      fs.existsSync(uploadPath) || fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// API handler function
const handler = (req:any, res:any) => {
  if (req.method === 'POST') {
    upload.single('file')(req, res, (err: any) => {
      if (err) {
        return res.status(500).json({ error: 'Error during file upload', details: err.message });
      }
      
      // If file upload is successful, return the file name
      if (req.file) {
        return res.status(200).json({ fileName: req.file.filename });
      }

      return res.status(400).json({ error: 'No file uploaded' });
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default handler;
