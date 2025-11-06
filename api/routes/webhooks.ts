import { Router } from "express";
import sesRouter from "./webhooks/ses";

const router = Router();

router.use("/ses", sesRouter);

export default router;
