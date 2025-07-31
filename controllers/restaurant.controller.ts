import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.mdel";
import uploadImageOnCloudinary from "../utils/uploadImageOnCloudinary";

export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { restaurantName, deliveryTime, cuisines, city, country, coverImage } = req.body;

        if (!restaurantName || !deliveryTime || !cuisines || !city || !country || !coverImage) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        const restaurant = await Restaurant.findOne({ owner: userId });
        if (restaurant) {
            return res.status(400).json({
                message: "Restaurant already exists for this user",
                success: false
            });
        }

        // Upload to Cloudinary
        const cloudinaryUrl = await uploadImageOnCloudinary(coverImage);

        const newRestaurant = await Restaurant.create({
            owner: userId,
            restaurantName,
            deliveryTime,
            cuisines: JSON.parse(cuisines),
            city,
            country,
            coverImage: cloudinaryUrl
        });

        return res.status(201).json({
            message: "Restaurant created successfully",
            success: true,
            restaurant: newRestaurant
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false 
        });
    }
};


