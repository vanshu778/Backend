import {asyncHandler} from "../utils/asyncHandler.js";


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
})

export {registerUser}
