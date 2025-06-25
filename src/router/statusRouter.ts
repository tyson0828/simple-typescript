// router/statusRouter.ts
import express from "express";
import pool from "../db/db";

const router = express.Router();

router.get("/getJobStatus", async (req, res) => {
  const { requestId, azureAccessToken } = req.query;

  // TODO: Validate azureAccessToken

  const result = await pool.query("SELECT status FROM jobs WHERE request_id=$1", [requestId]);
  res.json({ requestId, status: result.rows[0]?.status || "UNKNOWN" });
});

export default router;

