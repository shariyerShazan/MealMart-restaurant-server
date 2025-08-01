import { Order } from '../models/order.model';
import { Restaurant } from './../models/restaurant.model';
import { Request, Response } from 'express';
import Stripe from "stripe"
import dotenv from "dotenv"
dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

type CheckoutSessionRequest = {
    cartItems:{
        menuId : string,
        foodName: string , 
        price  : number,
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

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card" ],
            shipping_address_collection: {
                allowed_countries: ["US" , "CA" , "BD"] 
            },
            line_items: lineItems ,
            mode: "payment" ,
            success_url: `${process.env.FRONTEND_URL}/order` ,
            cancel_url:  `${process.env.FRONTEND_URL}/cart` ,
            metadata: {
                orderId: (order._id as string).toString(), 
                foodImage :  JSON.stringify(menuItems.map((item:any)=> item.foodImage))
            }
        })
        if(!session.url){
            return res.status(400).json({
                message : "Error while creating session" ,
                success: false
            })
        }
        await order.save() 
        return res.status(200).json({
            message : "Session created" ,
            session ,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message :"Internal server error" ,
            success: false
        })
    }
}



export const createLineItems = (checkoutSessionRequest :CheckoutSessionRequest  , menuItems :any )=>{
    const lineItems = checkoutSessionRequest.cartItems.map((cartItem)=>{
        const menuItem =  menuItems.find((item: any)=>(item._id.toString() === cartItem.menuId))
        if(!menuItem) throw new Error(`Menu item id not found`)
        return {
           price_data: {
            currency: "usd" ,
            product_data: {
                name : menuItem.foodName,
                images: [menuItem.foodImage]
            },
            unit_amount: menuItem.price * 100, 
           },
           quantity: cartItem.quantity ,
          
        }
    })
    return lineItems
}




export const getOrders = async (req: Request , res: Response)=>{
    try {
        const orders = await Order.find({orderBy: req.userId}).populate("orderBy").populate("restaurant")
        if(orders.length === 0){
            return res.status(400).json({
                 message : "Order not found" ,
                 success: false
            })
        }
        return res.status(200).json({
            message : "Your orders" , 
            orders ,
            success: true
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message :"Internal server error" ,
            success: false
        })
    }
}