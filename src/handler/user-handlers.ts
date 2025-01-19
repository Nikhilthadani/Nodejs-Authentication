import { Request, Response } from "express";
import { pool } from "../mysql/connection";
import {
  GET_USER_BY_EMAIL,
  GET_USER_BY_ID,
  GET_USERS_QUERY,
  INSERT_USER_STATEMENT,
} from "../mysql/queries";
import {
  createToken,
  saveRefreshToken,
} from "../middlewares/jwt-token-manager";
import { redisClient } from "../redis";
import { encryptData } from "../middlewares/jwt-validator";

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
    const insertedId = JSON.parse(JSON.stringify(result))[0].insertId;

    return res.status(200).json({ insertedId });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  console.log("Request for LOGINNNNNNNNNNNNNNNNNN");

  try {
    const { email, password } = req.body;
    const conn = await pool.getConnection();
    const result = await conn.query(GET_USER_BY_EMAIL, [email]);

    const user = JSON.parse(JSON.stringify(result))[0][0];
    if (user.password !== password) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const accessToken = createToken(String(user.id), user.email, "access");
    res.cookie("auth_token", accessToken, {
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    const refreshToken = encryptData(
      createToken(String(user.id), user.email, "refresh")
    );
    res.cookie("refresh_token", refreshToken, {
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    await saveRefreshToken(String(user.id), refreshToken);

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
};
