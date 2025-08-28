import mongoose, { Document } from "mongoose";

type IDeliveryInfo = {
    email: string;
    fullName: string;
    address: string;
    city: string;
    contact: string ;
    country: string;
};

type ICartItem = {
    menuId: string;
    foodName: string;
    foodImage: string;
    price: number;
    quantity: number;
};

export interface IOrder extends Document {
    orderBy: mongoose.Schema.Types.ObjectId;
    restaurant: mongoose.Schema.Types.ObjectId;
    deliveryInfo: IDeliveryInfo;
    cartItems: ICartItem[];
    totalAmount: number;
    status: "Pending" | "Confirmed" | "Preparing" | "OutForDelivery" | "Delivered";
}

const orderSchema = new mongoose.Schema<IOrder>(
    {
        orderBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
        deliveryInfo: {
            email: { type: String, required: true },
            fullName: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            contact: { type: String, required: true },
            country: { type: String, required: true },
        },
        cartItems: [
            {
                menuId: { type: String, required: true },
                foodName: { type: String, required: true },
                foodImage: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
            },
        ],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Preparing", "OutForDelivery", "Delivered"],
            default: "Pending",
        }
    },
    { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
