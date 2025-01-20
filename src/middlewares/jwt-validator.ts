import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { getCache, setCache } from "../redis/actions";
import {
  createToken,
  decryptToken,
  saveRefreshToken,
} from "./jwt-token-manager";
import { decode, JwtPayload } from "jsonwebtoken";

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

function getSecondsToExpire(tokenExp: number) {
  const currentTime = Math.floor(Date.now() / 1000);

  const secondsToExpire = tokenExp - currentTime;

  return secondsToExpire > 0 ? secondsToExpire : 0; // Return 0 if already expired
}

async function validateAccessToken(accessToken: string) {
  const decryptedData = await decryptToken(accessToken);
  if (decryptedData) {
    return { ...decryptedData };
  } else {
    return false;
  }
}

async function validateRefreshToken(refreshToken: string) {
  const encryptedToken = decryptData(refreshToken);
  const decryptedData = await decryptToken(encryptedToken);
  if (!decryptedData) return false;

  const tokenFromCache = await getCache("auth", decryptedData.id);
  if (!tokenFromCache) {
    console.log("tokenFromCache not valid");
    return false;
  }
  if (tokenFromCache !== refreshToken) {
    console.log("Token mismatch from what we have");
    return false;
  }

  const tokenFromCacheDecrypted = await decryptToken(
    decryptData(tokenFromCache)
  );
  if (!tokenFromCacheDecrypted) {
    console.log(
      "Token expired in cache: tokenFromCacheDecrypted cant be decrypted"
    );
    return false;
  }

  const ttl = getSecondsToExpire(tokenFromCacheDecrypted.exp);
  if (ttl <= 0) {
    console.log("Token time expired:: ", ttl);
    return;
  }
  return { ...tokenFromCacheDecrypted };
}

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const [bearer, refresh] = req.headers!.authorization!.split(",");
  const accessToken = bearer.split("=")[1];
  const refreshToken = refresh.split("=")[1];

  //---------------------
  const isAccessTokenValid = await validateAccessToken(accessToken.trim());
  const decodedRefreshToken = await validateRefreshToken(refreshToken.trim());

  if (isAccessTokenValid && decodedRefreshToken) {
    console.log("Access, Refresh token valid: Sending response back");
    return res.status(200).json({ message: "Authorized", success: true });
  } else if (!isAccessTokenValid && decodedRefreshToken) {
    // regenerate access, refresh token
    const newAccessToken = createToken(
      decodedRefreshToken.id,
      decodedRefreshToken.email,
      "access"
    );

    const newRefreshToken = encryptData(
      createToken(decodedRefreshToken.id, decodedRefreshToken.email, "refresh")
    );

    console.log(
      "new access, refresh tokens generated: ",
      accessToken,
      refreshToken
    );
    await saveRefreshToken(decodedRefreshToken.id, newRefreshToken);
    res.cookie("auth_token", newAccessToken, {
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refresh_token", newRefreshToken, {
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({
      message: "New access, refresh tokens generated: ",
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } else {
    res.status(401).json({ message: "Not authorized", success: false });
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
