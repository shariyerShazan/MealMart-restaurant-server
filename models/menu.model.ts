import mongoose, { Document } from "mongoose";

export interface IMenu {
    foodName: string ,
    description: string ,
    price: number ,
    foodImage : string
}

export interface IMenuDocumnet extends IMenu , Document {
    createdAt: Date ,
    updatedAt: Date
}

const menuSchema = new  mongoose.Schema<IMenuDocumnet>({
    foodName: {
        type: String ,
        required: true
    },
    description: {
        type: String ,
        required: true
    },
    price: {
        type: Number ,
        required: true
    },
    foodImage : {
        type: String ,
        required: true
    }
}, {timestamps: true})

export const Menu = mongoose.model<IMenuDocumnet>("Menu" , menuSchema)