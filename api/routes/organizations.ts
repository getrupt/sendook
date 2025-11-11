import { Router } from "express";
import apiKeyRouter from "./organizations/apiKeys";

const router = Router();

router.use("/:organizationId/apiKey", apiKeyRouter);

export default router;
