import { Pool, createPool } from "mysql2/promise";
import { CREATE_TABLE_USERS } from "./tables";

const getConfig = () => {
  return {
    database: "auth",
    port: Number(process.env.MYSQL_PORT),
    password: process.env.MYSQL_ROOT_PASSWORD,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_ROOT_USER,
  };
};
let pool: Pool;
const connectToSql = async () => {
  try {
    pool = createPool(getConfig());
    await pool.getConnection();
    await pool.execute(CREATE_TABLE_USERS);
    console.log("Connection ok");
  } catch (error) {
    console.log("Error with MySQL", error);
    throw error;
  }
};

export { connectToSql, pool };
