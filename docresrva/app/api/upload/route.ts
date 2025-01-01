import { IncomingForm, Fields, Files } from 'formidable'; // Import types from formidable
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { pipeline } from 'stream';
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  S3_BUCKET_NAME,
} from '../../../components/utils/constant';

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});

// Disable Next.js's default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to pipe request stream into formidable parser
const parseForm = (reqStream: ReadableStream<Uint8Array>): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      uploadDir: './tmp',  // Temporary upload directory
      keepExtensions: true,  // Preserve file extensions
      multiples: true,  // Allow multiple files (if needed)
    });

    form.parse(reqStream as any, (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};

// Directly handle the file upload with formidable
export async function POST(req: Request) {
  try {
    // Create a stream from the incoming request body
    const reqStream = req.body ? req.body.getReader() : null;
    if (!reqStream) {
      return NextResponse.json({ error: 'No body in the request' }, { status: 400 });
    }

    // Use a Promise to handle the form parsing
    const { fields, files } = await parseForm(reqStream as any);  // Parse the form data

    // Access the file from the parsed files (ensure TypeScript knows the type)
    const file = (files as Files).file?.[0];  // Ensure you have a file (use Files type)
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Ensure mimetype is either a string or fallback to 'application/octet-stream'
    const contentType = file.mimetype || 'application/octet-stream';  // Fallback to binary if null

    // Generate a unique file name
    const fileName = `${uuidv4()}-${file.originalFilename}`;
    const bucketName = S3_BUCKET_NAME;

    // Upload file to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fs.createReadStream(file.filepath),  // File stream for S3 upload
      ContentType: contentType,  // Ensure ContentType is a string (fallback to 'application/octet-stream')
    });

    await s3.send(command);

    // Generate the file URL
    const fileUrl = `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;

    // Return the file URL as a JSON response
    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error uploading file.' }, { status: 500 });
  }
}
 