import { Router } from "express";
import apiKeyRouter from "./organizations/apiKey";
import inboxRouter from "./organizations/inbox";

const router = Router();

router.use("/:organizationId/apiKey", apiKeyRouter);
router.use("/:organizationId/inbox", inboxRouter);

export default router;
