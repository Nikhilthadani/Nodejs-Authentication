import { Router } from "express";
import { getUsers, registerUser } from "../handler/user-handlers";
const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/me", getUsers);

userRouter.get("/register", registerUser);
userRouter.get("/login", getUsers);

export default userRouter;
