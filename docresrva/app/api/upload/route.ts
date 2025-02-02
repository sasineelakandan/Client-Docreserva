import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// Ensure "uploads" folder exists
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
const uploadMiddleware = upload.single("file");

// Convert Multer callback to Promise
const uploadAsync = promisify(uploadMiddleware);

export default async function handler(req:any, res: NextApiResponse) {
  

  try {
    // Handle file upload
    await uploadAsync(req as any, res as any);

    if (!req.file) {
      return res.status(400).json({ error: "File not uploaded" });
    }

    const fileUrl = `/uploads/${(req as any).file.filename}`;
    return res.status(200).json({ url: fileUrl });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "File upload failed" });
  }
}

// Disable default bodyParser (Multer handles it)
export const config = {
  api: {
    bodyParser: false,
  },
};
