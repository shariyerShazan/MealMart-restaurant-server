import express  from "express";
import { isAutenticated } from "../middlewares/isAuthenticated";
import upload from "../middlewares/multer";
import { createRestaurant, getOwnRestaurant, getRestaurantOrder, getSingleRestaurant, searchRestaurant, updateRestaurant } from "../controllers/restaurant.controller";

const router = express.Router()

router.post("/" , isAutenticated , upload.single("coverImage") , createRestaurant)
router.patch("/" , isAutenticated , upload.single("coverImage") , updateRestaurant)


router.get("/own" , isAutenticated ,  getOwnRestaurant)
router.get("/orders" , isAutenticated ,  getRestaurantOrder)


// public route
router.get("/search" ,  searchRestaurant)
router.get("/:restaurantId" ,  getSingleRestaurant)


export default router