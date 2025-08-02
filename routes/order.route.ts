import express from "express"
import { isAutenticated } from "../middlewares/isAuthenticated"
import { createChectoutSession, getOrders } from "../controllers/order.controller"

const router = express.Router()

router.get("/" , isAutenticated , getOrders)
router.post("/create-checkout-session" , isAutenticated , createChectoutSession)
// router.post("/webhook")

export default router