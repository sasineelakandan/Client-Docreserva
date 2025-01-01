import multer from 'multer';
import fs from 'fs';
import path from 'path';

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// POST handler for file upload
export async function POST(request: Request) {
  return new Promise<Response>((resolve, reject) => {
    // Create a dummy `req` object to handle the file upload via multer
    const req = { ...request } as any;

    // Call multer to handle file upload
    upload.single('file')(req, req, (err: any) => {
      if (err) {
        return reject(new Response(JSON.stringify({ error: 'Error during file upload', details: err.message }), { status: 500 }));
      }

      // If file upload is successful
      if (req.file) {
        return resolve(new Response(JSON.stringify({ fileName: req.file.filename }), { status: 200 }));
      }

      return resolve(new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 }));
    });
  });
}
