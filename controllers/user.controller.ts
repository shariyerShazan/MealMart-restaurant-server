import { Request, Response } from "express"
import { User } from "../models/user.model"
import bcrypt from "bcryptjs"

export const register = async (req:Request , res: Response)=>{
    try {
        const {fullName , email , password, contact} = req.body
        if(!fullName || !email || !password || !contact){
            return res.status(403).json({
                message : "something is missing" ,
                success : false
            })
        }
        const user = await User.findOne({email})
        if(user){
            return res.status(400).json({
                message : "User already exist with this email" ,
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password , 10)
        const verificationToken = "peea"

        const newUser = await User.create({
            fullName ,
            email ,
            password : hashedPassword ,
            verificationToken ,
            verificationTokenExpiresdAt : Date.now()+1*60*60*1000 ,
        })
        // await sendVerificationEmail(email , verificationToken)

        return res.status(200).json({
            message : "Account created successfully" ,
            success: true
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
           message : "Internal server error" ,
           success: false
        })
    }
}



