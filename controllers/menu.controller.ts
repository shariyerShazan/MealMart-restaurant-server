import { Request, Response } from "express";
import uploadImageOnCloudinary from "../utils/uploadImageOnCloudinary";
import { Menu } from "../models/menu.model";
import { Restaurant } from "../models/restaurant.model";
import mongoose from "mongoose";

export const addMenu = async (req: Request, res: Response) => {
    try {
        const { foodName, description, price, foodImage } = req.body;

        if (!foodName || !description || !price || !foodImage) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }

        const foodImageURL = await uploadImageOnCloudinary(foodImage);

        const restaurant = await Restaurant.findOne({ owner: req.userId });
        if (!restaurant) {
            return res.status(404).json({
                message: "You must create a restaurant first",
                success: false
            });
        }

        const menu = await Menu.create({
            foodName,
            description,
            price,
            foodImage: foodImageURL
        });

        restaurant.menus.push(menu._id as mongoose.Schema.Types.ObjectId);
        await restaurant.save();

        return res.status(201).json({
            message: "Menu added successfully",
            success: true,
            menu
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
