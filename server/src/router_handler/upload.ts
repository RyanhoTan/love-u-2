import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getAuthenticatedUserId } from "../auth.js";
import { config } from "../config.js";

const proxyUrl = process.env.HTTPS_PROXY?.trim() || process.env.HTTP_PROXY?.trim();

const r2Client = new S3Client({
  region: "auto",
  endpoint: config.r2Endpoint,
  credentials: {
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey,
  },
  ...(proxyUrl
    ? {
        requestHandler: new NodeHttpHandler({
          httpsAgent: new HttpsProxyAgent(proxyUrl),
        }),
      }
    : {}),
});

function getExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts[parts.length - 1];
}

export async function uploadMediaBuffer(
  userId: number,
  folder: string,
  fileName: string,
  contentType: string,
  body: Buffer,
) {
  const extension = getExtension(fileName);
  const key = `${folder}/${userId}/${Date.now()}-${randomUUID()}.${extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.r2Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return {
    key,
    url: `${config.r2PublicUrl}/${key}`,
  };
}

export async function uploadMedia(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const folder = String(req.query.folder);
  const fileName = String(req.header("x-file-name"));
  const contentType = String(req.header("content-type"));
  const result = await uploadMediaBuffer(
    userId,
    folder,
    fileName,
    contentType,
    req.body as Buffer,
  );

  res.status(201).json(result);
}
