import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

export const protectedRoute = async (req,res,next) => {
    try {
        const accessToken = req.cookies.accessToken;
        
        if(!accessToken){
            return res.status(401).json({message: "Access token is required"});
        }

        try{

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findbyid(decoded.userId).select("-password")

        if(!user){
            return res.status(401).json({message: "User not found"})
        }

        req.user = user;

        next()
    } catch (error) {
        if (error.name == "TokenExpiredError") {
            res.status(401).json({message: "Token expired"})
        }
    }
    
}

catch(error){
        console.log(error.message)
        res.status(500).json({message: "Internal server error"})
}
}

export const adminRoute = async (req,res,next) => {
    if (req.user && req.user.role == "admin") {
        next();
    }
    else {
        res.status(401).json({message:"Admin access denied"})

    }
}