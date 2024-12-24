import { Router } from "express";
import express from "express";
import StripeController from "../controller/StripeController";
import validateApiKey from "../middlewares/AuthMiddleware";

const router = Router();
router.use(validateApiKey);

router.get('/', (_req, res) => {
    res.send('API de pagamento utilizando o stripe!');
  });

router.post('/subscribe', StripeController.subscribe);
router.post('/cancelSubscription', StripeController.cancelSubscription);
router.post('/updateSubscription', StripeController.updateSubscription);
router.post('/handleWebhook', express.raw({ type: "application/json" }), StripeController.handleWebhook);

export default router;