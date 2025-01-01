import { IncomingForm, Fields, Files } from 'formidable'; // Import types from formidable
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
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

// Helper function to convert Request body to a Node.js Readable Stream
function toIncomingMessage(req: Request): Readable {
  const readable :any= new Readable({
    read() {
      req.body?.getReader().read().then(({ done, value }) => {
        if (done) {
          this.push(null); // End the stream
        } else {
          this.push(value); // Push the chunk
        }
      });
    },
  });

  // Add necessary headers to the stream object
  readable.headers = Object.fromEntries(req.headers.entries());
  readable.method = req.method;
  readable.url = req.url;
  return readable;
}

// Helper function to parse the form data
const parseForm = (reqStream: Readable): Promise<{ fields: Fields; files: Files }> => {
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

// Handle the file upload with formidable
export async function POST(req: Request) {
  try {
    // Convert the request body to a readable stream
    const reqStream = toIncomingMessage(req);

    // Ensure the stream has a proper content-length
    const contentLength = req.headers.get('content-length');
    if (!contentLength) {
      return NextResponse.json({ error: 'Missing Content-Length header' }, { status: 400 });
    }

    // Parse the form data
    const { fields, files } = await parseForm(reqStream);

    const file = (files as Files).file?.[0]; // Access the uploaded file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Ensure the content type is either a string or a fallback to 'application/octet-stream'
    const contentType = file.mimetype || 'application/octet-stream';

    // Generate a unique file name
    const fileName = `${uuidv4()}-${file.originalFilename}`;
    const bucketName = S3_BUCKET_NAME;

    // Upload file to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fs.createReadStream(file.filepath),  // File stream for S3 upload
      ContentType: contentType,  // Set the correct MIME type
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
