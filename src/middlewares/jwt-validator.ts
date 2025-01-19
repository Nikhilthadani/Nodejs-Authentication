import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { getCache, setCache } from "../redis/actions";
import {
  createToken,
  decryptToken,
  saveRefreshToken,
} from "./jwt-token-manager";
const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const validateWithRedisAndJwt = async (
  topkenFromClient: string,
  tokenFromRedis: string
) => {
  if (tokenFromRedis === topkenFromClient) {
    const decodeRedisToken = await decryptToken(tokenFromRedis);
    const decodeClienToken = await decryptToken(topkenFromClient);
  }
};
export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [bearer, refresh] = req.headers!.authorization!.split(",");
  const accessToken = bearer.split("=")[1];
  const refreshToken = refresh.split("=")[1];

  const decodedAccessToken = await decryptToken(accessToken);
  if (decodedAccessToken) {
    console.log("Access token is valid!");
    return res
      .status(200)
      .json({ message: "Token authorization successful", success: true });
  }

  const decryptedRefreshToken = await decryptToken(
    decryptData(refreshToken.trim())
  );
  if (!decryptedRefreshToken) {
    return res
      .status(401)
      .json({ message: "Refresh token expired, please login again" });
  }

  console.log("Refresh token valid, generating new Access, Refresh tokens...");

  console.log("Decrypted refresh token::", decryptedRefreshToken);

  const cacheValue = await getCache("auth", decryptedRefreshToken.id);

  if (!cacheValue) {
    return res.status(401).json({
      message: "Refresh token expired",
      success: false,
    });
  }

  // if cache is available, refreshtoken is avalialble, validate eqality and expiry;
  if (cacheValue.trim() !== refreshToken.trim()) {
    return res
      .status(401)
      .json({ message: "Refresh token is tampered", success: false });
  }

  const decodedCache = await decryptToken(decryptData(cacheValue));
  if (decodedCache?.exp === decryptedRefreshToken.exp) {
    // generate new access token
    const newAccessToken = createToken(
      decodedCache.id,
      decodedCache.email,
      "access"
    );
    const newRefreshToken = encryptData(
      createToken(decodedCache.id, decodedCache.email, "refresh")
    );

    await saveRefreshToken(decodedCache.id, newRefreshToken);
    console.log(
      "New tokens generated and saved in cache",
      newAccessToken,
      newRefreshToken
    );

    return res.status(201).json({
      message: "New tokens generated, update them!",
      success: true,
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    });
  } else {
    res
      .status(401)
      .json({ message: "Something went wrong, token expiry invalid" });
  }
};

// Encryption function
export const encryptData = (data: string) => {
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Decryption function
export const decryptData = (encrypted: string) => {
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
