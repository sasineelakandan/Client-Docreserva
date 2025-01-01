import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } from '../../../components/utils/constant';

// Initialize the S3 client
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

// Helper: Convert `Request` to a Node.js `IncomingMessage`-like stream


function toIncomingMessage(req: Request): any {
  const readable: any = new Readable({
    async read() {
      // Read the request body stream asynchronously
      const reader = req.body?.getReader();
      if (!reader) {
        this.push(null); // End the stream if no reader exists
        return;
      }

      // Keep reading the stream until it's done
      try {
        let done = false;
        while (!done) {
          const { value, done: readDone } = await reader.read();
          done = readDone;
          if (value) {
            this.push(value); // Push the chunk to the stream
          }
        }
        this.push(null); // End the stream when all chunks are read
      } catch (error) {
        console.error('Error reading request body:', error);
        this.push(null); // End the stream in case of error
      }
    },
  });

  // Add required properties to match IncomingMessage interface
  readable.headers = Object.fromEntries(req.headers.entries());
  readable.method = req.method;
  readable.url = req.url;

  return readable;
}

// POST handler for file upload
export async function POST(req: Request) {
  const form = new IncomingForm();
  
  // Wrap formidable's parse method in a Promise
  const parseForm = (stream: any): Promise<{ fields:any; files:any }> =>
    new Promise((resolve, reject) => {
      form.parse(stream, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

  try {
    const stream = toIncomingMessage(req); // Convert the Fetch API Request to a compatible stream
    const { fields, files } = await parseForm(stream);
    const file = (files as any)?.file?.[0]; // Ensure the file is retrieved
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Generate a unique file name
    const fileName = `${uuidv4()}-${file.originalFilename}`;
    const bucketName = S3_BUCKET_NAME;
    
    // Upload file to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fs.createReadStream(file.filepath), // File stream for S3 upload
      ContentType: file.mimetype, // Set correct MIME type
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
