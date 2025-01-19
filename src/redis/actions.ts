import { redisClient } from ".";
import { decryptData } from "../middlewares/jwt-validator";

const generateKey = (model: string, key: string) => {
  return model + "-" + key;
};
const setCache = async (
  model: string,
  key: string,
  value: string,
  expirySeconds: number
) => {
  // for refreshtoken > auth-userId: refreshToken
  key = generateKey(model, key);
  try {
    await redisClient.set(key, value, { EX: expirySeconds });
    console.log("Set cache key: ", key, "Value: ", value);
  } catch (err) {
    console.log("Error wile setting key: ", key, err);
    throw err;
  }
};

const getCache = async (model: string, key: string) => {
  key = generateKey(model, key);
  try {
    const value = await redisClient.get(key);
    console.log("Get cache key: ", key, "Value: ", value);
    return value;
  } catch (err) {
    console.log("Error wile getting key: ", key, err);
    throw err;
  }
};

export { getCache, setCache };
