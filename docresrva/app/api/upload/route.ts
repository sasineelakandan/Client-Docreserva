import { Readable } from 'stream';
import formidable, { IncomingForm, Fields, Files } from 'formidable';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import fs from 'fs';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } from '../../../components/utils/constant';

// Initialize the S3 client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});
console.log('step 1');

// Disable Next.js's default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};
console.log('step 2');
// Helper: Convert `Request` to a Node.js `IncomingMessage`-like stream
function toIncomingMessage(req: Request): Readable {
  const readable : any = new Readable({
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
  console.log('step 3');
  // Add required properties to match `IncomingMessage`
  readable.headers = Object.fromEntries(req.headers.entries());
  readable.method = req.method;
  readable.url = req.url;

  return readable;
}

// Export the POST method
export async function POST(req: Request) {
  console.log('step 4');
  const form = new IncomingForm();

  // Wrap formidable's parse method in a Promise
  const parseForm = (stream: Readable): Promise<{ fields: Fields; files: Files }> =>
    new Promise((resolve, reject) => {
      form.parse(stream as any, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

  try {
    console.log('step 5');
    const stream = toIncomingMessage(req); // Convert the Fetch API Request to a compatible stream
    const { fields, files } = await parseForm(stream);

    const file = (files as any)?.file?.[0]; // Ensure the file is retrieved
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    console.log('step 6');

    // Generate a unique file name
    const fileName = `${uuidv4()}-${file.originalFilename}`;
    const bucketName = S3_BUCKET_NAME;
    console.log('step 7');
    // Read file into buffer
    const buffer = await fs.promises.readFile(file.filepath);

    // Upload file to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer, // Use the buffer instead of the file stream
      ContentType: file.mimetype, // Set correct MIME type
    });
    console.log('step 8');
    await s3.send(command);
    console.log('step 9');
    // Generate the file URL
    const fileUrl = `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;

    // Return the file URL as a JSON response
    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error uploading file.' }, { status: 500 });
  }
}
