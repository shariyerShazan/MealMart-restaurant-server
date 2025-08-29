import express from "express"
import { isAutenticated } from "../middlewares/isAuthenticated"
import { createCheckoutSession, getAdminOrder, getOrders, stripeWebhook } from "../controllers/order.controller"

const router = express.Router()

router.get("/" , isAutenticated , getOrders)
router.post("/create-checkout-session" , isAutenticated , createCheckoutSession)

router.get("/overview-order" , isAutenticated , getAdminOrder)

router.post( "/webhook",  express.raw({ type: "application/json" }), stripeWebhook);


export default router 