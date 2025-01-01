import { IncomingForm } from 'formidable'; // Import formidable for handling form data
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

async function uploadFileToS3(fileBuffer:any, fileName:any, contentType:any) {
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
  } catch (error:any) {
    console.error(`Error uploading file ${fileName} to S3:`, error.message);
    throw new Error('Error uploading file to S3');
  }
}

export async function POST(request:any) {
  console.log('Received POST request for file upload.');

  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    console.log('Parsing the form data...');

    form.parse(request, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the form:', err.message);
        resolve(NextResponse.json({ error: 'Error parsing the form.' }, { status: 400 }));
        return;
      }

      console.log('Form data parsed successfully:', { fields, files });

      const file:any = files.file;

      // Check if a file was provided
      if (!file) {
        console.warn('No file provided in the form.');
        resolve(NextResponse.json({ error: 'File is required.' }, { status: 400 }));
        return;
      }

      try {
        console.log(`Reading file: ${file.originalFilename} from ${file.filepath}`);

        // Read the file buffer
        const fileBuffer = fs.readFileSync(file.filepath);

        // Generate a unique file name
        const fileName = `${Date.now()}-${file.originalFilename}`;
        console.log(`Generated unique file name: ${fileName}`);

        // Upload the file to S3
        await uploadFileToS3(fileBuffer, fileName, file.mimetype);

        console.log('File uploaded successfully to S3. Returning response.');

        // Return success response with file name
        resolve(NextResponse.json({ success: true, fileName }));
      } catch (error:any) {
        console.error('Error during file upload process:', error.message);
        resolve(NextResponse.json({ error: 'File upload failed.' }, { status: 500 }));
      } finally {
        // Clean up temporary file
        if (file?.filepath) {
          fs.unlink(file.filepath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error cleaning up temporary file:', unlinkErr.message);
            } else {
              console.log('Temporary file cleaned up successfully.');
            }
          });
        }
      }
    });
  });
}
