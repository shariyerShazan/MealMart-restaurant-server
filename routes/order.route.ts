import express from "express"
import { isAutenticated } from "../middlewares/isAuthenticated"
import { createChectoutSession, getAdminOrder, getOrders } from "../controllers/order.controller"

const router = express.Router()

router.get("/" , isAutenticated , getOrders)
router.post("/create-checkout-session" , isAutenticated , createChectoutSession)
router.get("/overview-order" , isAutenticated , getAdminOrder)
// router.post("/webhook")

export default router