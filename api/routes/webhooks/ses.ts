import { Router } from "express";
import { handleDeliveryNotification } from "../../controllers/SESController";

const router = Router();

router.post("/", async (req, res) => {
  const payload = JSON.parse(req.body);
  if (payload.Type !== "Notification") {
    return res.status(200).send();
  }
  await handleDeliveryNotification(payload.Message);
  return res.status(200).send();
});

export default router;
