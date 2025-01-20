import { decode, JwtPayload, sign, verify } from "jsonwebtoken";
import { setCache } from "../redis/actions";
import { decryptData } from "./jwt-validator";
type JwtData = {
  id: string;
  email: string;
  iat: number;
  exp: number;
};

function getSecondsToExpire(token: string) {
  try {
    token = decryptData(token);
    // Decode the token without verifying signature
    const decoded = decode(token) as JwtPayload;

    if (!decoded || !decoded.exp) {
      console.log("Token does not have an 'exp' claim.");
      throw new Error("Token does not have an 'exp' claim.");
    }

    // Current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Remaining seconds
    const secondsToExpire = decoded!.exp! - currentTime;

    return secondsToExpire > 0 ? secondsToExpire : 0; // Return 0 if already expired
  } catch (err) {
    console.error("Error decoding token:", err);
    return null; // Return null on error
  }
}

const createToken = (
  id: string,
  email: string,
  tokenType: "access" | "refresh"
) => {
  return sign({ id, email }, process.env.JWT_SECRET!, {
    expiresIn: tokenType === "access" ? "15" : "7d",
  });
};

const decryptToken = (token: string): Promise<null | JwtData> => {
  return new Promise((res) => {
    return verify(token, process.env.JWT_SECRET!, (err, payload) => {
      if (err) {
        console.log("Error", err);
        return res(null);
      } else {
        console.log("Token Decrypted: ", JSON.stringify(payload));
        return res(payload as JwtData);
      }
    });
  });
};

const updateToken = async (
  refreshToken: string,
  userId: string,
  email: string
) => {
  const decryptedToken = await decryptToken(refreshToken);
  if (!decryptedToken) {
    console.log("Refresh token not valid, sign in again");
    return "Refresh token not valid, sign in again";
  }
  const newAccessToken = createToken(userId, email, "access");
  return newAccessToken;
};

const saveRefreshToken = async (userId: string, token: string) => {
  const mod = "auth";
  try {
    const expiry = getSecondsToExpire(token);
    if (!expiry || expiry === 0) {
      console.log("Expired token");
      return;
    }
    await setCache(mod, userId, token, expiry);
    console.log("Refresh token saved for user: ", userId);
    return;
  } catch (error) {
    console.log("Eror while setting refresh token: ", token, error);
    throw error;
  }
};

export { createToken, saveRefreshToken, decryptToken, updateToken };
