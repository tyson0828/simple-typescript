// router/index.ts
import { Router } from "express";
import smbRouter from "./smbRouter";
import jobRouter from "./jobRouter";
import statusRouter from "./statusRouter";
import authRouter from "./authRouter";

const apiRouter = Router();

apiRouter.use("/", authRouter);
apiRouter.use("/", authRouter);
apiRouter.use("/", jobRouter);
apiRouter.use("/", statusRouter);
apiRouter.use("/smb", smbRouter);  // SMB routes under /api/smb

export default apiRouter;

