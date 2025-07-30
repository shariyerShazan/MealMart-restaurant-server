import  express  from "express";
import { forgotPassword, login, logout, register, resetPassword, updateProfile, verifyEmail } from "../controllers/user.controller";
import { isAutenticated } from "../middlewares/isAuthenticated";

const router = express.Router()


router.post("/register" , register)
router.post("/login" , login)
router.post("/logout" , logout)
router.post("/verify-email" , verifyEmail)
router.post("/forgot-password" , forgotPassword)
router.post("/reset-password/:token" , resetPassword)
router.patch("/update-profile" , isAutenticated , updateProfile)


export default router