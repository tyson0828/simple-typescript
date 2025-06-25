// src/router/authRouter.ts
import express from "express";

const router = express.Router();

router.get("/session-test", (req, res) => {
  if (!req.session.views) req.session.views = 0;
  req.session.views++;
  res.json({ views: req.session.views });
});

router.get("/debug-session", (req, res) => {
  res.json({ session: req.session });
});

export default router;

