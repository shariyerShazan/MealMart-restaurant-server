import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName : {
        type: String ,
        required: true
    } ,
    email : {
        type: String ,
        required: true ,
    }, 
    constact : {
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