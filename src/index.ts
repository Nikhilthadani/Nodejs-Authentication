import { config } from "dotenv";
import app from "./app";
import { connectToSql } from "./mysql/connection";
import { initializeRedis } from "./redis";
config();

async function init() {
  try {
    await connectToSql();
    await initializeRedis();
    app.listen(5000, () => console.log("Server open"));
  } catch (error) {
    console.log("Error initializing: ", error);
    process.exit(1);
  }
}

init();
