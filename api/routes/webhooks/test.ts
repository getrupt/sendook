import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  console.log("Received test webhook", req.body);
  return res.status(200).send();
});

export default router;
