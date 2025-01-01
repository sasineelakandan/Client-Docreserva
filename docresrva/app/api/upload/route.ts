import { IncomingForm } from 'formidable';
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
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

// Directly handle the file upload with formidable
export async function POST(req: Request) {
  // Initialize formidable's IncomingForm to parse the form
  const form = new IncomingForm({
    uploadDir: './tmp',  // Temporary upload directory
    keepExtensions: true,  // Preserve file extensions
    multiples: true,  // Allow multiple files (if needed)
  });

  // Wrap formidable's parse method in a Promise
  const parseForm = (stream: any): Promise<{ fields:any; files:any }> =>
    new Promise((resolve, reject) => {
      form.parse(stream, (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);  // Log any parse errors
          reject(err);
        }
        console.log('Parsed fields:', fields);  // Log parsed fields
        console.log('Parsed files:', files);    // Log parsed files
        resolve({ fields, files });
      });
    });

  try {
    // Directly pass the req to formidable
    const { fields, files } = await parseForm(req);  // No need to convert to a stream manually

    const file = (files as any)?.file?.[0];  // Ensure you have a file
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
      Body: fs.createReadStream(file.filepath),  // File stream for S3 upload
      ContentType: file.mimetype,  // Set correct MIME type
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
