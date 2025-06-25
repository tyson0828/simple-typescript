// src/router/authRouter.ts
import express from "express";
import passport from "passport";

const router = express.Router();

// Redirect to Azure login
router.get("/login", passport.authenticate("azuread-openidconnect", {
  failureRedirect: "/login-failure"
}));

// Azure callback
router.get("/auth/openid/return",
  passport.authenticate("azuread-openidconnect", {
    failureRedirect: "/login-failure"
  }),
  (req, res) => {
    res.redirect("/"); // Redirect after login
  }
);

// Login failure
router.get("/login-failure", (req, res) => {
  res.status(401).send("Login Failed");
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

export default router;

