import { response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadingOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async (req , res) => {

    // get user details from frontend
    const {fullName , email, username, password} = req.body
    console.log('email: ',email);


    // validation - not empty
    if(
        [ fullName , email, username,password].some(
            (field) => field?.trim() === "")
    ){
         throw new ApiError(400,'All Information is required')

    }
    // check if user already exist : username , email
    const extendedUser = await User.findOne( {
        $or: [{ email },{ username }]
    })
    console.log('extendedUser: ',extendedUser);

    if(extendedUser){
        throw new ApiError(409, 'User already existed with email || username')
    }

    // check for img and avatar
    
    const avatarLocationPath = req.files?.avatar[0]?.path;
    
    console.log('avatarLocationPath: ',avatarLocationPath);

    const coverImageLocationPath = req.files?.coverImage[0]?.path;
    console.log('coverImageLocationPath: ',coverImageLocationPath);

    if(!avatarLocationPath){
           throw new ApiError(400,'Avatar is required')
    }
    

    // uplode them to cloudinary , avatar
        
    const avatar = await uploadingOnCloudinary(avatarLocationPath);
        
    console.log(avatar);
        
    const coverImage = await uploadingOnCloudinary(coverImageLocationPath);
        
    console.log(coverImage)


    //login check img

    if(!avatar){
        
        throw new ApiError(400,'Avatar is required')
        
    }
        
    // crete user object - create entry in db

    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select
        ("-password -refreshToken")
    
        
    // check from user creations
    if(!createdUser){
        throw new ApiError(500,'Something went wrong with registering the user')
    }

    // return res 
    return res.status(200).json(
        new ApiResponse(200, createdUser,"User register Successfully")
    )
    }
)

export { registerUser }