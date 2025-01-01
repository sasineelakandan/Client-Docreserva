import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } from '../../../components/utils/constant';

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize the S3 client
const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});

async function uploadFileToS3(fileBuffer: Buffer, fileName: string, contentType: string) {
  console.log(`Preparing to upload file: ${fileName} to S3`);

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType || 'application/octet-stream',
  };

  const command = new PutObjectCommand(params);
  try {
    console.log(`Uploading file: ${fileName} to bucket: ${S3_BUCKET_NAME}`);
    await s3.send(command);
    console.log(`Successfully uploaded ${fileName} to S3.`);
    return fileName;
  } catch (error: any) {
    console.error(`Error uploading file ${fileName} to S3:`, error.message);
    throw new Error('Error uploading file to S3');
  }
}

export async function POST(request:any) {
  console.log('Received POST request for file upload.');

  // Use the multer upload middleware to handle the file upload
  const form = upload.single('file'); // 'file' is the name of the field in the form

  // Return a promise for the response
  return new Promise<NextResponse>((resolve, reject) => {
    console.log('Processing form data...');
    form(request as any, {} as any, async (err: any) => {
      if (err) {
        console.error('Error during file upload:', err.message);
        return resolve(NextResponse.json({ error: 'Error parsing the form.' }, { status: 400 }));
      }

      const file = request.file;
      if (!file) {
        console.warn('No file provided in the form.');
        return resolve(NextResponse.json({ error: 'File is required.' }, { status: 400 }));
      }

      console.log(`Received file: ${file.originalname}, size: ${file.size} bytes`);

      try {
        const fileBuffer = file.buffer;
        const fileName = `${Date.now()}-${file.originalname}`;
        console.log(`Generated unique file name: ${fileName}`);

        // Upload the file to S3
        await uploadFileToS3(fileBuffer, fileName, file.mimetype);

        console.log('File uploaded successfully to S3. Returning response.');

        // Return success response with file name
        return resolve(NextResponse.json({ success: true, fileName }));
      } catch (error: any) {
        console.error('Error during file upload process:', error.message);
        return resolve(NextResponse.json({ error: 'File upload failed.' }, { status: 500 }));
      }
    });
  });
}
