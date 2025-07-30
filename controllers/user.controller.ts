import { Request, Response } from "express"
import { User } from "../models/user.model"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

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



export const login = async (req: Request , res: Response){
    try {
        const {email , password} = req.body
        if(!email || !password){
            return res.status(403).json({
                message : "Someting is missing" ,
                success : false
            })
        } 
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({
                message : "User not exist with this email" ,
                success: false
              })
        }
        const matchPassword = await bcrypt.compare(password , user?.password)
        if(!matchPassword){
              return res.status(400).json({
                message : "Invalid password" ,
                success: false
              })
        }

        // generateToken(req , user)
        user.lastLogin = new Date()
        await user.save()
        const userWithoutPassword = await User.findOne({email}).select("-password")
        return res.status(200).json({
            message : `Welcome back ${user.fullName}` ,
            user :  userWithoutPassword ,
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


export const verifyEmail = async (req : Request , res: Response){
    try {
          const {verificationCode} = req.body
          const user = await User.findOne({verificationToken: verificationCode , verificationTokenExpiresdAt: {gt: Date.now()}}).select("-password")

          if(!user){
            return res.status(400).json({
                  success: false ,
                  message : "Invalid or expired verification token"
            })
          }
          user.isVerified = true 
          user.verificationToken = undefined 
          user.verificationTokenExpiresdAt = undefined 
          await user.save()

        //  send Welcome email
        // await sendWelcomeEmail(user.email , user.fullName)
        return res.status(200).json({
            success: true , 
            message : "User varification succesfully" ,
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
           message : "Internal server error" ,
           success: false
        })
    }
}


export const logout = async (req : Request , res: Response){
    try {
        return res.clearCookie("token" ).status(200).json({
            message: "User Logged out successfully", 
            success: false
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
           message : "Internal server error" ,
           success: false
        }) 
    }
}