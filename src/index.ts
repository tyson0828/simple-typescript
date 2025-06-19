import express from "express";
import session from "express-session";
import passport from "passport";
import multer from "multer";
import authRouter from "./auth/auth";
import { triggerAirflowJob } from "./airflow/airflow";
import pool from "./db/db";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRouter);

// Async Batch Job Endpoint
app.post("/api/runBatchJob", upload.single("file"), async (req, res) => {
  const { wafers, operation, azureAccessToken } = req.body;

  // TODO: Validate azureAccessToken

  const requestId = await triggerAirflowJob(req.file, wafers, operation);
  await pool.query("INSERT INTO jobs(request_id, status) VALUES($1, $2)", [requestId, "RUNNING"]);
  res.json({ requestId });
});

// Get Job Status
app.get("/api/getJobStatus", async (req, res) => {

  // TODO: Validate azureAccessToken

  const result = await pool.query("SELECT status FROM jobs WHERE request_id=$1", [requestId]);
  res.json({ requestId, status: result.rows[0]?.status || "UNKNOWN" });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

