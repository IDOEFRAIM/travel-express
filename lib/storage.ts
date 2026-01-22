import { supabase } from '@/lib/supabase';
// Génère l'URL publique Supabase Storage pour un fichier
export function getSupabasePublicUrl(filePath: string, bucket = "agence") {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
}
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

// Nouvelle fonction d'upload vers Supabase Storage
export async function uploadFileToSupabase(file: File, filePath: string, bucket = "agence") {
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw new Error("Failed to upload file to Supabase Storage.");
  }
  // Retourne le chemin relatif à stocker en base
  return filePath;
}

export async function getFileUrl(fileKey: string) {
  // Si l'URL est déjà complète (http/https), retourne-la directement
  if (fileKey.startsWith('http')) return fileKey;
  // Sinon, retourne l'URL publique Supabase Storage
  return getSupabasePublicUrl(fileKey);
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
