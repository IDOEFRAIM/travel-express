import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const S3_BUCKET = process.env.S3_BUCKET || "agence-uploads";
const S3_REGION = process.env.S3_REGION || "us-east-1";
const S3_ENDPOINT = process.env.S3_ENDPOINT || "http://localhost:4566"; // LocalStack default

// Initialize S3 Client
// For LocalStack, we need to force path style and set the endpoint
export const s3Client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test", // LocalStack default
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test", // LocalStack default
  },
  forcePathStyle: true, // Needed for LocalStack
});

export async function uploadFileToS3(file: File | Buffer, fileName: string, contentType: string) {
  let buffer: Buffer;

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = file;
  }

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    // Return the URL or Key for storing in the DB
    // For local dev, we might construct a URL, but storing Key is better practice usually.
    // Let's return the KEY and a helper to get the public URL.
    return fileName;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to storage.");
  }
}

export async function getFileUrl(fileKey: string) {
   // Generate a signed URL for secure access
   // Or just a public URL if bucket is public. Let's use signed URL for security simulation.
   try {
     const command = new GetObjectCommand({
       Bucket: S3_BUCKET,
       Key: fileKey,
     });
     
     // Valid for 1 hour
     const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 
     return url;
   } catch (error) {
     console.error("Error generating signed URL:", error);
     return null;
   }
}

// Helper to ensure bucket exists (useful for initialization/seeding)
export async function ensureBucketExists() {
  try {
    const { CreateBucketCommand, HeadBucketCommand } = await import("@aws-sdk/client-s3");
    
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    } catch (e: any) {
        // If 404, bucket doesn't exist
        if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
             console.log(`Creating bucket ${S3_BUCKET}...`);
             await s3Client.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
             console.log(`Bucket ${S3_BUCKET} created.`);
        } else {
            throw e;
        }
    }
  } catch (error) {
      console.error("Error ensuring bucket exists:", error);
  }
}
