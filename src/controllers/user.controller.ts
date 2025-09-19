import { Request, Response } from "express"
import { User } from "../models/user.model"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
// import cloudinary from "../utils/cloudinary"
import { generateVerificationCode } from "../utils/generateVerificationCode"
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/email"
import uploadImageOnCloudinary from "../utils/uploadImageOnCloudinary"
import dotenv from "dotenv"
dotenv.config()


export const register = async (req:Request , res: Response)=>{
    try {
        const {fullName , email , password, contact} = req.body
        // console.log(fullName , email , password, contact)
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

        // password validation
        if (password.length < 6) {
            return res.status(400).json({
              success: false,
              message: "Password must be at least 6 characters long.",
            });
          }
          if (!/[a-zA-Z]/.test(password)) {
            return res.status(400).json({
              success: false,
              message: "Password must contain at least one  letter",
            });
          }    
          if (!/\d/.test(password)) {
            return res.status(400).json({
              success: false,
              message: "Password must contain at least one number",
            });
          }
    
        //   hash password
        const hashedPassword = await bcrypt.hash(password , 10)
        // generate verification code
        const verificationToken = generateVerificationCode()

        const newUser = await User.create({
            fullName ,
            email ,
            contact ,
            password : hashedPassword ,
            verificationToken ,
            verificationTokenExpiresdAt : new Date(Date.now() + 1*60*60*1000) ,
        })
        // send verification email
        await sendVerificationEmail(email , verificationToken)

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



export const login = async (req: Request , res: Response)=>{
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
        // if(!user.isVerified){
        //     return res.status(400).json({
        //         message : "You are not verified user" ,
        //         success: false
        //     })
        // }
        const matchPassword = await bcrypt.compare(password , user?.password)
        if(!matchPassword){
              return res.status(400).json({
                message : "Invalid password" ,
                success: false
              })
        }
        const token = jwt.sign({userId : user._id} , process.env.SECRET_KEY! , {expiresIn : "7d"})

        user.lastLogin = new Date()
        await user.save()
        const userWithoutPassword = await User.findOne({email}).select("-password")

        return res.cookie("token" , token , {httpOnly: true ,    secure: true,  sameSite: "none" , maxAge: 7*24*60*60*1000 , path:'/'}).status(200).json({
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


export const verifyEmail = async (req : Request , res: Response)=>{
    try {
          const {verificationCode} = req.body
          const user = await User.findOne({verificationToken: verificationCode , verificationTokenExpiresdAt: { $gt: new Date()}}).select("-password")

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
        await sendWelcomeEmail(user.email , user.fullName)
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


export const logout = async (req : Request , res: Response)=>{
    try {
        return res
  .clearCookie("token", {
    httpOnly: true,
    secure: true,  
    sameSite: "none", 
    path: "/"       
  })
  .status(200)
  .json({
    message: "User Logged out successfully",
    success: true
  });

    } catch (error) {
        console.log(error)
        res.status(500).json({
           message : "Internal server error" ,
           success: false
        }) 
    }
}


export const forgotPassword = async (req : Request , res: Response)=>{
    try {
        const {email} = req.body 
        const user = await User.findOne({email}) 
        if(!user){
            return res.status(400).json({
                message : "User doesn't exist with this mail" ,
                success: false
            })
        }
        const resetToken = crypto.randomBytes(40).toString("hex")
        const resetTokenExpiresAt = new Date(Date.now()+1*60*60*1000)
        user.resetPasswordToken = resetToken 
        user.resetPasswordTokenExpiresdAt = resetTokenExpiresAt 
        await user.save()

        // send email to reset passowrd
        await sendPasswordResetEmail(user.email , `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`)

        return res.status(200).json({
            message : "Password reset link sent to your email" ,
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

export const resetPassword = async (req : Request , res: Response)=>{
    try {
        const {token} = req.params 
        const {newPassword} = req.body
        if(!newPassword){
            return res.status(400).json({
                message : "Password is required" ,
                success: false
            })
        } 
        const user = await User.findOne({resetPasswordToken: token , resetPasswordTokenExpiresdAt : {$gt : Date.now()}})
        if(!user){
            return res.status(400).json({
                success: false ,
                message : "Invalid or expired verification token"
          })
        }
        const hashedPassowrd = await bcrypt.hash(newPassword , 10)
        user.password = hashedPassowrd
        user.resetPasswordToken = undefined 
        user.resetPasswordTokenExpiresdAt = undefined 
        user.save()

        // send success reset password email
        await sendResetSuccessEmail(user.email);

        return res.status(200).json({
            message: "Password reset successfully",
            success: true
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
           message : "Internal server error" ,
           success: false
        }) 
    }
}


export const checkAuth = async (req : Request , res: Response)=>{
    try {
        const userId = req.userId
        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(404).json({
                message : "User not found" ,
                success: false
            })
        }
        return res.status(200).json({
            success: true ,
            user ,
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
           message : "Internal server error" ,
           success: false
        }) 
    }
}




export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const { fullName, address, city, country, contact } = req.body;
        const file = req.file; 

        if (fullName) user.fullName = fullName;
        // if (email) user.email = email;
        if (contact) user.contact = contact;
        if (address) user.address = address;
        if (city) user.city = city;
        if (country) user.country = country;
        if (file) {
            user.profilePicture = await uploadImageOnCloudinary(file);
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
};
