import express from "express"
import { isAutenticated } from "../middlewares/isAuthenticated"
import { confirmOrder, createCheckoutSession, getAdminOrder, getOrders, stripeWebhook } from "../controllers/order.controller"

const router = express.Router()

router.get("/" , isAutenticated , getOrders)
router.post("/create-checkout-session" , isAutenticated , createCheckoutSession)
router.get("/overview-order" , isAutenticated , getAdminOrder)
// router.patch("/confirm-order" , isAutenticated , confirmOrder)
router.post( "/webhook",  express.raw({ type: "application/json" }), stripeWebhook);


export default router