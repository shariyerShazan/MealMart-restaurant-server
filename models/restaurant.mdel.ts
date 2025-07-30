import mongoose, { Document } from "mongoose";

export interface IRestaurant {
    owner : mongoose.Schema.Types.ObjectId ,
    restaurantName : string ,
    city: string ,
    country : string ,
    deliveryTime: number ,
    cuisines: string[] ,
    menus: mongoose.Schema.Types.ObjectId[]
    coverImage: string
}
export interface IRestauratDocument extends IRestaurant ,  Document {
    createdAt: Date ,
    updatedAt : Date
}

const restaurantSchema = new mongoose.Schema<IRestauratDocument>({
         owner: {
            type: mongoose.Schema.Types.ObjectId ,
            ref: "User" ,
            required : true
         } ,
         restaurantName : {
            type: String,
            required : true
         },
         city : {
            type: String,
            required : true
         },
         country : {
            type: String,
            required : true
         },
         deliveryTime : {
            type: Number,
            required : true
         } ,
         cuisines : [{
            type: String ,
            required: true
        }] ,
        menus : [{ 
            type: mongoose.Schema.Types.ObjectId ,
            ref: "Menu" ,
        }] ,
        coverImage : {
            type : String ,
            required: true
        }
} ,{timestamps: true}) 

export const Restaurant = mongoose.model("Restaurant" , restaurantSchema)