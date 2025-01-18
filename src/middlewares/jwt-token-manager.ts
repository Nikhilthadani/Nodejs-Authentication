import { sign, verify } from "jsonwebtoken";
import { cacheValue } from "../redis/actions";

const createToken = (
  id: string,
  email: string,
  tokenType: "access" | "refresh"
) => {
  return sign({ id, email }, process.env.JWT_SECRET!, {
    expiresIn: tokenType === "access" ? "7h" : "7d",
  });
};

const decryptToken = (token: string) => {
  return new Promise((res) => {
    return verify(token, process.env.JWT_SECRET!, (err, payload) => {
      if (err) {
        console.log("Error", err);
        return res(null);
      } else {
        console.log("Token Decrypted: ", JSON.stringify(payload));
        return res(payload);
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
  const key = userId;
  const mod = "mysql";
  try {
    await cacheValue(mod, userId, token);
    console.log("Refresh token saved for user: ", userId);
    return;
  } catch (error) {
    console.log("Eror while setting refresh token: ", token, error);
    throw error;
  }
};

export { createToken, saveRefreshToken, decryptToken, updateToken };
