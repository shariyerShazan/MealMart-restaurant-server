import { Request, Response } from "express";
import { Restaurant } from "../models/restaurant.model";
import uploadImageOnCloudinary from "../utils/uploadImageOnCloudinary";
import { Order } from "../models/order.model";

export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { restaurantName, deliveryTime, cuisines, city, country } = req.body;
        const file = req.file; 

        if (!restaurantName || !deliveryTime || !cuisines || !city || !country ) {
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
        let coverImageUpload: string | undefined;
        if (file) {
             coverImageUpload = await uploadImageOnCloudinary(file);
        }


        const restaurant = await Restaurant.findOne({ owner: userId });
        if (restaurant) {
            return res.status(400).json({
                message: "Restaurant already exists for this user",
                success: false
            });
        }

        const newRestaurant = await Restaurant.create({
            owner: userId,
            restaurantName,
            deliveryTime : Number(deliveryTime),
            cuisines: cuisines.split(",").map((c: string) => c.trim()),
            city,
            country,
            coverImage: coverImageUpload
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
        const restaurant = await Restaurant.findOne({owner: userId}).populate({
            path: "menus" , options: {createdAt: -1}
        })
        
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
        const { restaurantName, deliveryTime, cuisines, city, country } = req.body;
        const file = req.file; 
        const restaurant = await Restaurant.findOne({owner: userId})
        if(!restaurant){
            return res.status(404).json({
                message: "Restaurant not found",
                success: false
            })
        }
       if(restaurantName) {restaurant.restaurantName = restaurantName}
       if(deliveryTime) {
        restaurant.deliveryTime = Number(deliveryTime);
      }
       if(cuisines) {restaurant.cuisines = cuisines.split(",").map((c: string) => c.trim())}
       if(city) {restaurant.city = city}
       if(country) {restaurant.country = country}
       
       let coverImageUpload: string | undefined;;
       if(file){
         coverImageUpload = await uploadImageOnCloudinary(file);
         restaurant.coverImage = coverImageUpload;
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
        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized", success: false });
          }
          
        const restaurant = await Restaurant.findOne({ owner: userId });
        if (!restaurant) {
            return res.status(404).json({
                message: "Restaurant not found",
                success: false
            });
        }
        const orders = await Order.find({ restaurant: restaurant._id  ,   status: { $ne: "Pending" }})
            .populate({ path: "orderBy", select: "fullName email" })       
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





export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const  {orderId}  = req.params;
        const { status } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        order.status = status;
        await order.save();
        return res.status(200).json({
            success: true,
            status:order.status,
            message: "Status updated"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}




export const searchRestaurant = async (req: Request, res: Response) => {
    try {
        const { searchText, cuisines, page = 1, limit = 10 } = req.query;

        const query: any = {};
        // Text search
        if (searchText && searchText !== "") {
            query.$or = [
                { restaurantName: { $regex: searchText, $options: "i" } },
                { city: { $regex: searchText, $options: "i" } },
                { country: { $regex: searchText, $options: "i" } }
            ];
        }

        // Cuisines filter
        if (cuisines) {
            const cuisinesArray = (cuisines as string).split(",").map(c => c.trim());
            query.cuisines = { $in: cuisinesArray };
        }

        // Pagination
        const pageNumber = parseInt(page as string) || 1;
        const pageSize = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * pageSize;

        const restaurants = await Restaurant.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const total = await Restaurant.countDocuments(query);

        return res.status(200).json({
            success: true,
            message: "Restaurants fetched successfully",
            restaurants,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};


export const getSingleRestaurant = async (req: Request , res: Response)=>{
    try {
        const restaurantId = req.params.restaurantId
        const restaurant = await Restaurant.findById(restaurantId).populate({
            path: "menus" , options: {createdAt: -1}
        })
        if(!restaurant){
            return res.status(404).json({
                message : "Restaurant not found" ,
                success: false
            })
        }
        return res.status(200).json({
            message : "Restaurant here" ,
            restaurant ,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
}
