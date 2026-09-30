import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken'
import {User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,_,next)=>{
    try{

        const authHeader = req.header("Authorization");

        const token = req.cookies?.accessToken || (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);
        
        console.log("cookie:", req.cookies?.accessToken);
        console.log("header:", req.header("Authorization"));
        console.log("token:", token);

              
        // const decodedToken = jwt.verify(token.trim(), process.env.ACCESS_TOKEN_SECRET);
        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        
    
        if (!token){
            throw new ApiError(401,'unauthorized request')
        }

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401,'Invalid Access Token')
        }

        req.user = user;
        next()
    }catch(error){
        throw new ApiError(401, error?.message || 'Invalide access token ')
        
    }

})