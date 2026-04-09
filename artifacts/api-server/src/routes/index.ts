import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";
import paymentsRouter from "./payments";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/api", aiRouter);
router.use("/payments", paymentsRouter);
router.use("/stripe", stripeRouter);

export default router;
