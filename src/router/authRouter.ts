// File: src/router/authRouter.ts
import express from "express";
import { azureAuthenticate } from "../auth/auth";

const router = express.Router();

router.get("/login", azureAuthenticate);

router.get("/auth/openid/return", azureAuthenticate, (req, res) => {
  res.redirect("/"); // Redirect after login success
});

router.get("/login-failure", (req, res) => {
  res.status(401).send("Login Failed");
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;

