import { createClient } from "redis";

let redisClient = createClient();
const initializeRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.log("Error initializing redis");
    throw error;
  }
};

export { redisClient, initializeRedis };
