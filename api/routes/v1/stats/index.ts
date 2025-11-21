import { Router } from "express";
import messagesRouter from "./messages";

const router = Router({ mergeParams: true });

router.use("/messages", messagesRouter);

export default router;
