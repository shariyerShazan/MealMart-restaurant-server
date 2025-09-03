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
    deliveryInfo: {
        email: string ,
        contact: string ,
        fullName: string ,
        address: string ,
        city : string ,
        country : string ,
    } ,
    restaurantId : string,
    totalAmount: number
}




export const createCheckoutSession = async (req: Request , res: Response)=>{
    try {
        const checkoutSessionRequest:CheckoutSessionRequest = req.body
        console.log(checkoutSessionRequest);  
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
            deliveryInfo: checkoutSessionRequest.deliveryInfo ,
            cartItems: checkoutSessionRequest.cartItems ,
            totalAmount: checkoutSessionRequest.totalAmount,
            status: "Pending" ,

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
            sessionId:   session.id ,
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




  export const stripeWebhook = async (req: Request, res: Response) => {
    let event;

    try {
        const signature = req.headers["stripe-signature"];

        // Construct the payload string for verification
        const payloadString = JSON.stringify(req.body, null, 2);
        const secret = process.env.WEBHOOK_ENDPOINT_SECRET!;

        // Generate test header string for event construction
        const header = stripe.webhooks.generateTestHeaderString({
            payload: payloadString,
            secret,
        });

        // Construct the event using the payload string and header
        event = stripe.webhooks.constructEvent(payloadString, header, secret);
    } catch (error: any) {
        console.error('Webhook error:', error.message);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    // Handle the checkout session completed event
    if (event.type === "checkout.session.completed") {
        try {
            const session = event.data.object as Stripe.Checkout.Session;
            const order = await Order.findById(session.metadata?.orderId);

            if (!order) {
                return res.status(404).json({ message: "Order not found" });
            }

            // Update the order with the amount and status
            if (session.amount_total) {
                order.totalAmount = session.amount_total;
            }
             order.status= "Confirmed" 
             await order.save()
        } catch (error) {
            console.error('Error handling event:', error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
    // Send a 200 response to acknowledge receipt of the event
    res.status(200).send();
};



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
        const orders = await Order.find({orderBy: req.userId ,   status: { $ne: "Pending" }}).populate("orderBy").populate("restaurant")
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



export const getAdminOrder = async (req : Request , res: Response)=>{
    try {
        const restaurant = await Restaurant.findOne({owner: req.userId})
        if(!restaurant){
            return res.status(400).json({
                message : "You Have no restaurant yet" ,
                success: false
            })
        }
        const orders = await Order.find({restaurant: restaurant._id}).populate({
            path: "orderBy" ,
            select: "fullName  email"
        })
          if(!orders){
            return res.status(400).json({
                message : "None one order currently" ,
                success: false
            })
          }
          return res.status(200).json({
            message : "Your Orders", 
            success: true ,
            orders
          })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message :"Internal server error" ,
            success: false
        })
    } 
}