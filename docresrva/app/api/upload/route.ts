import { IncomingMessage, ServerResponse } from 'http';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { NextApiRequest, NextApiResponse } from 'next';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } from '../../../components/utils/constant';

// Initialize the S3 client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});

// Configure multer to use memory storage (files will be stored in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Disable Next.js's default body parsing
export const config = {
  api: {
    bodyParser: false, // This is needed for `multer` to work
  },
};

// Helper to handle the file upload using multer and AWS S3
const uploadFileToS3 = async (file: Express.Multer.File | any) => {
  const fileName = `${uuidv4()}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer, // Use the file buffer directly
    ContentType: file.mimetype, // Set the MIME type
  });

  await s3.send(command);
  return `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
};

// API handler to upload the file
export default async function handler(req: any, res: NextApiResponse) {
  return new Promise<void>((resolve, reject) => {
    // Use multer to parse the incoming form data
    upload.single('file')(req as any, res as any, async (err: any) => {
      if (err) {
        res.status(500).json({ error: 'Error processing the file.' });
        reject(err);
        return;
      }

      // Access the uploaded file via req.file
      const file = req.file as any;

      if (!file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
      }

      try {
        const fileUrl = await uploadFileToS3(file);
        res.status(200).json({ url: fileUrl });
        resolve();
      } catch (error) {
        res.status(500).json({ error: 'Error uploading file to S3.' });
        reject(error);
      }
    });
  });
}
