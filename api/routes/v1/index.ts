import { Router } from "express";
import inboxesRouter from "./inboxes";

const router = Router({ mergeParams: true });

router.use("/inboxes", inboxesRouter);

export default router;