import { Request, Response } from "express";
import uploadImageOnCloudinary from "../utils/uploadImageOnCloudinary";
import { Menu } from "../models/menu.model";
import { Restaurant } from "../models/restaurant.model";
import mongoose from "mongoose";

export const addMenu = async (req: Request, res: Response) => {
    try {
        const { foodName, description, price, } = req.body;
        const file = req.file; 
        if (!foodName || !description || !price ) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        } 
          if(!file){
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        }
        let foodImageUpload: string | undefined;
        if (file) {
            foodImageUpload = await uploadImageOnCloudinary(file);
        }
        

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
            price : Number(price),
            foodImage: foodImageUpload
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



export const editMenu = async (req: Request , res: Response)=>{
    try {
        const menuId = req.params.menuId
        const { foodName, description, price, foodImage } = req.body;
        const menu = await Menu.findById(menuId)
        if(!menu){
            return res.status(404).json({
                message : "Menu not found" ,
                success: false
            })
        }
        if(foodName){
            menu.foodName = foodName
        }
        if(description){
            menu.description = description
        }
        if(price){
            menu.price =  Number(price)
        }
        if(foodImage){
            const foodImageURL = await uploadImageOnCloudinary(foodImage as Express.Multer.File)
            menu.foodImage = foodImageURL
        }
        await menu.save()
        return res.status(200).json({
            message : "Menu updated succefully" ,
            success: true ,
            menu
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}


export const deleteMenu = async (req: Request, res: Response) => {
    try {
        const menuId = req.params.menuId;
        const restaurant = await Restaurant.findOne({ owner: req.userId });
        if (!restaurant) {
            return res.status(404).json({
                message: "You must create a restaurant first",
                success: false
            });
        }

        const ableToDelete = restaurant.menus.some(
            (id) => id.toString() === menuId
        );
        if (!ableToDelete) {
            return res.status(400).json({
                message: "You can't delete others' menu",
                success: false
            });
        }

        await Menu.findByIdAndDelete(menuId);
        restaurant.menus = restaurant.menus.filter(id => id.toString() !== menuId);
        await restaurant.save();

        return res.status(200).json({
            message: "Menu deleted successfully",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
