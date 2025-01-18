import { redisClient } from ".";

const cacheValue = async (model: string, key: string, value: string) => {
  key = model + "-" + key;
  try {
    await redisClient.set(key, value);
    console.log("Set cache key: ", key, "Value: ", value);
  } catch (err) {
    console.log("Error wile setting key: ", key, err);
    throw err;
  }
};

const getValue = async (model: string, key: string) => {
  key = model + "-" + key;
  try {
    const value = await redisClient.get(key);
    console.log("Get cache key: ", key, "Value: ", value);
    return value;
  } catch (err) {
    console.log("Error wile getting key: ", key, err);
    throw err;
  }
};

export { getValue, cacheValue };
