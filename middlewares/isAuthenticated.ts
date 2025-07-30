
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

declare global {
    namespace Express{
        interface Request {
             userId?: string
        }
    }
}

export const isAutenticated = async (req: Request , res: Response , next : NextFunction)=>{
        try {
             const token = req.cookies.token
              if(!token){
                return res.status(400).json({
                    message : "User not authenticated" ,
                    success: false
                })
              }
              const decode = await jwt.verify(token , process.env.SECRET_KEY!) as jwt.JwtPayload
              if(!decode){
                return res.status(401).json({
                    message : "Inavlid token" ,
                    success: false
                })
              }
              req.userId = decode.userId 
              next()
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message : "Internal server error" ,
                success: false
            })
        }
}