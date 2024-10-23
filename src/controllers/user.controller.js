import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"

const registerUser = asyncHandler(async(req,res) => {
    // res.status(200).json({
    //     message:"ok"
    // })
    // step-1 get user detail from frontend
    // step-2 validation - not empty 
    // step-3 check if user already exists: username, email 
    //step-4 check for images, check of avatar
    //step-5 upload them to cloudinary , avatar
    // step-6 create user object - create entry in db
    // step-7 remove password and refresh token field from response
    // step-8 check for user creattion 
    // step-9 return res

    const {fullName, email, username, password}= req.body
    console.log("email:",email);

    // if(fullName===""){
    //     throw new ApiError(400, "fullName is required")
    // }

    // second method 
    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    console.log(existedUser)
    if(existedUser){
        throw new ApiError(409,"User with email or username already exists")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
})

export {registerUser}
