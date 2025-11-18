import { Router } from "express";
import sesRouter from "./webhooks/ses";
import testRouter from "./webhooks/test";

const router = Router();

router.use("/ses", sesRouter);
router.use("/test", testRouter);

export default router;
