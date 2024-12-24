import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type DeleteObjectCommandInput,
  type GetObjectCommandInput,
  type PutObjectCommandInput,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const writeS3 = async (
  s3Config: S3ClientConfig,
  putConfig: PutObjectCommandInput,
  file: File
) => {
  const s3 = new S3Client(s3Config);
  const command = new PutObjectCommand({
    ...putConfig,
    Body: (await file.arrayBuffer()) as any,
  });

  try {
    return await s3.send(command);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteS3 = async (
  s3Config: S3ClientConfig,
  deleteParams: DeleteObjectCommandInput
) => {
  const s3 = new S3Client(s3Config);
  const command = new DeleteObjectCommand(deleteParams);

  try {
    return await s3.send(command);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const loadS3 = async (s3Config: S3ClientConfig, getParams: GetObjectCommandInput) => {
  const s3 = new S3Client(s3Config);
  const command = new GetObjectCommand(getParams);

  try {
    const response = await s3.send(command);
    return await response.Body!.transformToByteArray();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getSignedS3Url = async (
  s3Config: S3ClientConfig,
  getParams: GetObjectCommandInput
) => {
  const s3 = new S3Client(s3Config);
  const command = new GetObjectCommand(getParams);
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};
