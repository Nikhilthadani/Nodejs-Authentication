import { Router } from "express";
import { getUsers, loginUser, registerUser } from "../handler/user-handlers";
const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/me", getUsers);

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

export default userRouter;
