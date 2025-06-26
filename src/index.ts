// index.ts
import express from "express";
import session from "express-session";

import dotenv from "dotenv";
dotenv.config();

console.log("AZURE_CLIENT_ID:", process.env.AZURE_CLIENT_ID);

import passport from "passport";
import apiRouter from "./router";



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

