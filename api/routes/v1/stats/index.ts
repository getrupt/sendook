import { Router } from "express";
import messagesRouter from "./messages";
import usageRouter from "./usage";

const router = Router({ mergeParams: true });

router.use("/messages", messagesRouter);
router.use("/usage", usageRouter);

export default router;
