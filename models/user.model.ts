
import mongoose, { Document } from "mongoose";

export interface IUser {
    fullName : string ,
    email: string , 
    password: string ,
    contact : number ,
    address: string ,
    city : string ,
    country : string ,
    profile: string ,
    admin: boolean ,
    lastLogin?: Date ,
    isVerified?: boolean ,
    resetPasswordToken?: String  ,
    resetPasswordTokenExpiresdAt?: Date ,
    verificationToken?: String  ,
    verificationTokenExpiresdAt?: Date ,
}
export interface IUserDocument extends IUser ,  Document {
    createdAt: Date ,
    updatedAt : Date
}

const userSchema = new mongoose.Schema<IUserDocument>({
    fullName : {
        type: String ,
        required: true
    } ,
    email : {
        type: String ,
        required: true ,
    }, 
     password: {
       type : String ,
       required: true
    },
    contact : {
        type: Number ,
        required: true
    },
    address : {
        type: String ,
       default: "Update your adress"
    },
    city : {
        type: String ,
       default: "Update your city"
    },
    country : {
        type: String ,
       default: "Update your country"
    },
    profile : {
        type: String ,
       default: ""
    } ,
    admin: {
        type : Boolean ,
        default: false
    } ,

       // advance authentication
    lastLogin : {
        type: Date ,
        default: Date.now
    }, 
    isVerified: {
        type : Boolean ,
        default: false
    } ,
    resetPasswordToken : String  ,
    resetPasswordTokenExpiresdAt: Date ,
    verificationToken : String  ,
    verificationTokenExpiresdAt: Date ,

}, {timestamps: true})


export const User = mongoose.model("User" , userSchema)