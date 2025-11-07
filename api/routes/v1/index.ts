import { Router } from "express";
import inboxesRouter from "./inboxes";
import messagesRouter from "./inboxes/messages";

const router = Router({ mergeParams: true });

router.use("/inboxes", inboxesRouter);
router.use("/inboxes/:inboxId/messages", messagesRouter);

export default router;