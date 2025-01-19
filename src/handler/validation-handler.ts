import { Request, Response } from "express";
import { pool } from "../mysql/connection";
import { GET_USERS_QUERY } from "../mysql/queries";
export const validate = async (req: Request, res: Response) => {
  try {
    const conn = await pool.getConnection();
    const users = await conn.query(GET_USERS_QUERY);
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error" });
  }
};
