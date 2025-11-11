import { Router } from "express";
import inboxesRouter from "./inboxes";
import domainsRouter from "./domains";

const router = Router({ mergeParams: true });

router.use("/inboxes", inboxesRouter);
router.use("/domains", domainsRouter);

export default router;