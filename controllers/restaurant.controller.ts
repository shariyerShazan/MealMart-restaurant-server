import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.mdel";
import uploadImageOnCloudinary from "../utils/uploadImageOnCloudinary";
import { Order } from "../models/order.model";

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
            cuisines: cuisines.split(",").map((c: string) => c.trim()),
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



export const getOwnRestaurant = async (req : Request, res: Response)=>{
    try {
        const userId = req.userId
        const restaurant = await Restaurant.findOne({owner: userId})
        if(!restaurant){
            return res.status(404).json({
                message: "Restaurant not found",
                success: false
            })
        }
        return res.status(200).json({
            message : "Your restaurant" ,
            success: true ,
            restaurant
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false 
        });
    }
}


export const updateRestaurant = async (req : Request , res: Response)=>{
    try {
        const userId = req.userId
        const { restaurantName, deliveryTime, cuisines, city, country, coverImage } = req.body;
        const restaurant = await Restaurant.findOne({owner: userId})
        if(!restaurant){
            return res.status(404).json({
                message: "Restaurant not found",
                success: false
            })
        }
       if(restaurantName) {restaurant.restaurantName = restaurantName}
       if(deliveryTime) {restaurant.deliveryTime = deliveryTime}
       if(cuisines) {restaurant.cuisines = cuisines.split(",").map((c: string) => c.trim())}
       if(city) {restaurant.city = city}
       if(country) {restaurant.country = country}
       if(coverImage) {
        const cloudinaryUrl = await uploadImageOnCloudinary(coverImage)
        restaurant.coverImage = cloudinaryUrl
        }
        await  restaurant.save()
        return res.status(200).json({
            message : "Update restaurant successfully",
            success: true ,
            restaurant ,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false 
        });
    }
}


export const getRestaurantOrder = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const restaurant = await Restaurant.findOne({ owner: userId });
        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found",
                success: false
            });
        }
        const orders = await Order.find({ restaurant: restaurant._id })
            .populate({ path: "owner", select: "fullName email" })       
            .populate({ path: "restaurant", select: "restaurantName city country" }) 
            .sort({ createdAt: -1 });  
        return res.status(200).json({
            message: "Orders fetched successfully",
            success: true,
            orders
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
