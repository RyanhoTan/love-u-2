import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { HttpsProxyAgent } from "https-proxy-agent";
import { getAuthenticatedUserId } from "../auth.js";
import { config } from "../config.js";
import { assertMediaSignatureMatches } from "../media/mediaSignature.js";
import { getMediaUploadPolicy } from "../media/uploadPolicy.js";

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

export async function createMediaReadUrl(objectKey: string, expiresIn = 300) {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: config.r2Bucket,
      Key: objectKey,
    }),
    { expiresIn },
  );
}

export async function uploadMediaBuffer(
  userId: number,
  folder: string,
  contentType: string,
  body: Buffer,
) {
  const policy = getMediaUploadPolicy(folder, contentType, body.length);
  assertMediaSignatureMatches(policy.contentType, body);
  const key = `${policy.folder}/${userId}/${Date.now()}-${randomUUID()}.${policy.extension}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: config.r2Bucket,
      Key: key,
      Body: body,
      ContentType: policy.contentType,
    }),
  );

  return {
    key,
    url: `${config.r2PublicUrl}/${key}`,
  };
}

export async function uploadMedia(req: Request, res: Response) {
  const userId = getAuthenticatedUserId(req);
  const folder = typeof req.query.folder === "string" ? req.query.folder : "";
  const contentType = req.header("content-type") ?? "";
  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  const result = await uploadMediaBuffer(
    userId,
    folder,
    contentType,
    body,
  );

  // Do not expose the public object URL. Access URLs will be generated
  // separately after the caller has passed the media authorization check.
  res.status(201).json({
    key: result.key,
  });
}
