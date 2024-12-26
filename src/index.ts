import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import rateLimit from 'express-rate-limit';
import errorMiddleware from "./middlewares/ErrorMiddleware";

dotenv.config()

const app = express();

app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use((req, res, next) => {
  if (req.originalUrl === "/payment/handleWebhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

import stripeRoutes from "./routes/stripe";
app.use("/payment", stripeRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    // process.env.API_KEY ? console.log("API_KEY está definida") : console.log("Defina no .env a API_KEY");
    // process.env.STRIPE_PUBLISH_KEY ? console.log("STRIPE_PUBLISH_KEY está definida") : console.log("Defina no .env a STRIPE_PUBLISH_KEY");
    // process.env.STRIPE_SECRET_KEY ? console.log("STRIPE_SECRET_KEY está definida") : console.log("Defina no .env a STRIPE_SECRET_KEY");
    // process.env.STRIPE_WEBHOOK ? console.log("STRIPE_WEBHOOK está definida") : console.log("Defina no .env a STRIPE_WEBHOOK");
})

export default server;