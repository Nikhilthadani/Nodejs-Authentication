import { Router } from "express";
import userRouter from "./user";
import validateRouter from "./validate";

const appRouter = Router();

appRouter.use("/users", userRouter);
appRouter.use("/validate", validateRouter);

export default appRouter;
