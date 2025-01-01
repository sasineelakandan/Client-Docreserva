import { Readable } from 'stream';
import formidable, { IncomingForm } from 'formidable';
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

export const config = {
  api: {
    bodyParser: false,
  },
};

function toIncomingMessage(req: Request): any {
  const readable: any = new Readable({
    read() {
      req.body?.getReader().read().then(({ done, value }) => {
        if (done) {
          this.push(null); // End the stream
        } else {
          this.push(value); // Push the chunk
          console.log('Stream chunk:', value);  // Log the chunks
        }
      });
    },
  });

  readable.headers = Object.fromEntries(req.headers.entries());
  readable.method = req.method;
  readable.url = req.url;
  return readable;
}

export async function POST(req: Request) {
  const form = new IncomingForm({
    uploadDir: './tmp',  // Temporary upload directory
    keepExtensions: true,  // Keep the file extensions
    multiples: true,  // Allow multiple files if needed
  });

  const parseForm = (stream: any): Promise<{ fields: formidable.Fields; files: formidable.Files }> =>
    new Promise((resolve, reject) => {
      form.parse(stream, (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);
          reject(err);
        }
        console.log('Parsed fields:', fields);  // Log parsed fields
        console.log('Parsed files:', files);    // Log parsed files
        resolve({ fields, files });
      });
    });

  try {
    const stream = toIncomingMessage(req);
    const { fields, files } = await parseForm(stream);

    const file = (files as any)?.file?.[0];  // Get the file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileName = `${uuidv4()}-${file.originalFilename}`;
    const bucketName = S3_BUCKET_NAME;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fs.createReadStream(file.filepath),
      ContentType: file.mimetype,
    });

    await s3.send(command);

    const fileUrl = `https://${bucketName}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error uploading file.' }, { status: 500 });
  }
}
