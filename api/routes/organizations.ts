import { Router } from "express";
import apiKeyRouter from "./organizations/apiKeys";
import inboxRouter from "./organizations/inboxes";

const router = Router();

router.use("/:organizationId/apiKey", apiKeyRouter);
router.use("/:organizationId/inbox", inboxRouter);

export default router;
