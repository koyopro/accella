import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImageToS3(image: File, bucketName: string, key: string) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: key,
      Body: image.stream() as any,
      ContentType: image.type,
      ACL: "public-read",
    },
  });

  try {
    return await upload.done();
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
