import express from "express";
import expressSession from "express-session";
import { RedisStore } from "connect-redis";
import appRouter from "./router";
import { redisClient } from "./redis";

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

const app = express();

app.use(
  expressSession({
    secret: "YOUR_SESSION_SECRET",
    cookie: {
      domain: process.env.NODE_ENV === "production" ? "domain" : "localhost",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("------------------");

  console.log("Request Received at: ", req.url);
  console.log("Request Data: ", req.body);
  console.log("Request Cookie: ", req.headers.cookie);

  console.log("------------------");
  next();
});
app.use("/api/v1", appRouter);

export default app;
