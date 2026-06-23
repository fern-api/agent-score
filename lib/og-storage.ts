import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * OG-image storage on S3 — replaces the Supabase Storage `og-images` bucket
 * (FER-11415). Images are public-read and addressed by `<slug>.png`, exactly
 * as Supabase Storage served them. The bucket is provisioned by the
 * fern-platform `agent-score-deploy` CDK stack.
 *
 * Env:
 *   OG_S3_BUCKET            target bucket name (e.g. agent-score-prod-og-images)
 *   OG_S3_REGION            bucket region (default us-east-1)
 *   OG_S3_PUBLIC_URL_BASE   optional explicit public base; defaults to the
 *                           virtual-hosted S3 URL https://<bucket>.s3.<region>.amazonaws.com
 */
const REGION = process.env.OG_S3_REGION || 'us-east-1';

let _s3: S3Client | null = null;
function getS3(): S3Client {
  if (!_s3) _s3 = new S3Client({ region: REGION });
  return _s3;
}

function bucket(): string {
  const b = process.env.OG_S3_BUCKET;
  if (!b) throw new Error('OG_S3_BUCKET is not set');
  return b;
}

function publicUrlBase(): string {
  const explicit = process.env.OG_S3_PUBLIC_URL_BASE;
  if (explicit) return explicit.replace(/\/+$/, '');
  return `https://${bucket()}.s3.${REGION}.amazonaws.com`;
}

export async function uploadOgImage(slug: string, buffer: Buffer): Promise<void> {
  await getS3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: `${slug}.png`,
      Body: buffer,
      ContentType: 'image/png',
    })
  );
}

export function getOgImagePublicUrl(slug: string): string {
  return `${publicUrlBase()}/${slug}.png`;
}
