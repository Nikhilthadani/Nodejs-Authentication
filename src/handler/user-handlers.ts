import { Request, Response } from "express";
import { pool } from "../mysql/connection";
import {
  GET_USER_BY_ID,
  GET_USERS_QUERY,
  INSERT_USER_STATEMENT,
} from "../mysql/queries";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const conn = await pool.getConnection();
    const users = await conn.query(GET_USERS_QUERY);
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = res.locals.jwtData.id;
    const conn = await pool.getConnection();
    const user = await conn.query(GET_USER_BY_ID, [id]);
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error" });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query(INSERT_USER_STATEMENT, [
      name,
      email,
      password,
    ]);

    return res.status(200).json({ result });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error" });
  }
};
