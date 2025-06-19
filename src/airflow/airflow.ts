// src/airflow.ts
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const AIRFLOW_BASE_URL = 'http://your-airflow-host:8080/api/v1';
const AIRFLOW_DAG_ID = 'run_batch_job';
const AIRFLOW_USERNAME = 'your-username';
const AIRFLOW_PASSWORD = 'your-password';

interface JobInput {
  wafers: string[];
  operation: string;
  fileBase64: string;
}

export async function triggerAirflowJob(file: Express.Multer.File, wafers: string[], operation: string): Promise<string> {
  const requestId = uuidv4();
  const chunkSize = 10; // Split wafers into chunks of 10
  const chunks: string[][] = [];

  for (let i = 0; i < wafers.length; i += chunkSize) {
    chunks.push(wafers.slice(i, i + chunkSize));
  }

  const fileBase64 = file.buffer.toString('base64');

  for (const [index, chunk] of chunks.entries()) {
    const runId = `${requestId}-${index}`;
    const dagRunData: JobInput = {
      wafers: chunk,
      operation,
      fileBase64
    };

    await axios.post(
      `${AIRFLOW_BASE_URL}/dags/${AIRFLOW_DAG_ID}/dagRuns`,
      {
        dag_run_id: runId,
        conf: dagRunData
      },
      {
        auth: {
          username: AIRFLOW_USERNAME,
          password: AIRFLOW_PASSWORD
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  return requestId;
}

