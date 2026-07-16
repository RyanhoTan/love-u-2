import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getAuthenticatedUserId } from "../auth.js";
import { config } from "../config.js";

const r2Client = new S3Client({
  region: "auto",
  endpoint: config.r2Endpoint,
  credentials: {
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey,
  },
});

function getExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts[parts.length - 1];
}

export async function uploadMedia(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const fileName = String(req.header("x-file-name"));
  const contentType = String(req.header("content-type"));
  const extension = getExtension(fileName);
  const key = `album/${userId}/${Date.now()}-${randomUUID()}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.r2Bucket,
      Key: key,
      Body: req.body as Buffer,
      ContentType: contentType,
    }),
  );

  res.status(201).json({
    key,
    url: `${config.r2PublicUrl}/${key}`,
  });
}
