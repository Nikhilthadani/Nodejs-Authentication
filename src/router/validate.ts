import { Router } from "express";
import { validateToken } from "../middlewares/jwt-validator";
const validateRouter = Router();

validateRouter.get("/token", validateToken);

export default validateRouter;
