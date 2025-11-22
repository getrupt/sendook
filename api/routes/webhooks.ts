import { Router } from "express";
import sesRouter from "./webhooks/ses";
import testRouter from "./webhooks/test";
import stripeRouter from "./webhooks/stripe";

const router = Router();

router.use("/ses", sesRouter);
router.use("/test", testRouter);
router.use("/stripe", stripeRouter);

export default router;
