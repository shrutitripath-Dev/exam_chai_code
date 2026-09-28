import { response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadingOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generatAccesAndRefrehToken = async (userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        //saving refresh token in server 
        user.refreshToken = refreshToken
            await user.save({validateBeforeSave : false})
        return { accessToken , refreshToken }

    }catch(error){
        console.log('Real error is : ',error)
        throw new ApiError(500,"Error: Server problem no acces &brefresh token made ")
    }
}

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
    
const avatarLocationPath = req.files?.avatar?.[0]?.path;    
    console.log('avatarLocationPath: ',avatarLocationPath);

    let coverImageLocationPath;

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocationPath = req.files.coverImage[0].path
}
console.log('req.files: ', req.files);
console.log('req.body: ', req.body);
    // console.log('coverImageLocationPath: ',coverImageLocationPath);

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

const loginUser = asyncHandler( async (req , res) => {
//-----------------data for req------------------//
    const { email , username ,password } = req.body

//-----------------check the email || username------------------//
    if(!(email || username)){
        throw new ApiError(402,'User give the full Data ');
    }
//-----------------find the user------------------//
    const user = await User.findOne({
        $or : [{email},{username}]
    })

    if(!user){
        throw new ApiError(400,'User does not exist ');
    }
//-----------------check password------------------//
    const validPass = await user.isPasswordCorrect(password);

    if(!validPass){
        throw new ApiError(400,'Password Error');
    }
//-----------------create acces and refresh Token and give ------------------//

    const { accessToken , refreshToken} = await generatAccesAndRefrehToken(user._id)

    //--------------checking with  toking the user loging is same as server tokin or not------//

    const loggedInUser = await User.findById(user._id)
    .select('-password -refreshToken')

    //--------------------send the cooki ------------//
    const option= {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, option )
    .cookie('refreshToken', refreshToken, option )
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser , accessToken , refreshToken
            }, 
            "User logged in Successfuly "
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refrehToken: undefined
            }
        },
        {
            new: true
        }
    )

    //--------------------send the cooki ------------//
    const option= {
        httpOnly: true,
        secure:true
    }

    return res
    .status(200)
    .clearcookie('accessToken',  option )
    .clearcookie('refreshToken', refreshToken, option )
    .json(new ApiResponse(200,{},"User logged Out"))
}) 
export { registerUser , loginUser, logoutUser }
