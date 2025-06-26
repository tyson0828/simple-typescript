// router/jobRouter.ts
import express, { Request, Response } from "express";
import multer from "multer";
import { triggerAirflowJob } from "../airflow/airflow";
import pool from "../db/db";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/runBatchJob", upload.single("file"), async (req: Request, res: Response) => {
  const { wafers, operation, azureAccessToken } = req.body;

  // TODO: Validate azureAccessToken
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const requestId = await triggerAirflowJob(req.file, wafers, operation);
  await pool.query("INSERT INTO jobs(request_id, status) VALUES($1, $2)", [requestId, "RUNNING"]);
  res.json({ requestId });
});

export default router;

