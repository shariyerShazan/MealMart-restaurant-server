import { Order } from '../models/order.model';
import { Restaurant } from './../models/restaurant.model';
import { Request, Response } from 'express';
import Stripe from "stripe"

type CheckoutSessionRequest = {
    cartItems:{
        menuId : string,
        foodName: string , 
        price  : string,
        foodImage : string ,
        quantity: number

    }[] ,
    delivaryInfo: {
        email: string ,
        fullName: string ,
        adress: string ,
        city : string ,
    } ,
    restaurantId : string
}

type MenuItems ={
    menuId : string,
    foodName: string , 
    price  : string,
    foodImage : string ,
    quantity: number

}


export const createChectoutSession = async (req: Request , res: Response)=>{
    try {
        const checkoutSessionRequest:CheckoutSessionRequest = req.body
        const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId).populate("menus")
        if(!restaurant){
            return res.status(400).json({
                message : "Restaurant not found" ,
                success: false
            })
        }
        const order = await Order.create({
            orderBy: req.userId ,
            restaurant: restaurant._id ,
            deliveryInfo: checkoutSessionRequest.delivaryInfo ,
            cartItems: checkoutSessionRequest.cartItems ,
            status: "Pending"

        })
        const menuItems = restaurant.menus ;
        const lineItems = createLineItems(checkoutSessionRequest , menuItems)

        const 
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message :"Internal server error" ,
            success: false
        })
    }
}



export const createLineItems = async (checkoutSessionRequest :CheckoutSessionRequest  , menuItems :any )=>{
    const lineItems = checkoutSessionRequest.cartItems.map((cartItem)=>{
        const menuItem =  menuItems.find((item)=>(item._id === cartItem.menuId))
        if(!menuItem) throw new Error(`Menu item id not found`)
        return {
           price_data: {
            currency: "usd" ,
            product_data: {
                foodName : menuItem.foodName ,
                foodImage: menuItem.foodImage ,
            },
            unit_ammount: menuItem.price * 100
           },
           quantity: cartItem.quantity
        }
    })
    return lineItems
}