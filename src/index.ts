// index.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import apiRouter from "./router";

dotenv.config();

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true in HTTPS production
}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

// Mount all API routes
app.use("/api", apiRouter);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

