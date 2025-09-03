import express from "express" 
import { isAutenticated } from "../middlewares/isAuthenticated"
import upload from "../middlewares/multer"
import { addMenu, deleteMenu, editMenu } from "../controllers/menu.controller"

const router = express.Router()

router.post("/" , isAutenticated , upload.single("foodImage")  , addMenu)
router.patch("/:menuId" , isAutenticated , upload.single("foodImage")  , editMenu)
router.delete("/:menuId" , isAutenticated ,  deleteMenu)

export default router