import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token ")
    }
}

  const registerUser = asyncHandler(async (req, res) => {
    //   res.status(200).json({
    //     success: true,
    //     message: "Register User",
    //   });
    // Get User Details from frontend
    // Validation that not empty
    // Check if User Already Exists : UserName, Email
    // Check For Avatar And Image
    // Upload Them To Cloudinary Avatar
    // Create User Object - Create Entry In DB
    // Remove Password And Refresh Token From Field Of Response
    // Check For User Creation
    // Check For Response
    // Data From Json Or Form We Can Get Directly Through Req.body
    const { fullName, email, username, password } = req.body;
    console.log("Request Body:", req.body);
    console.log("Request Files:", req.files);
  
    // Validation
    // In Production Level There Is Separate File For This
    //   if (fullName === "") {
    //     throw new ApiError(400, "Full Name is required");
    //   }
  
    if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
    // Check If User Name Is Exists
    const existedUser = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existedUser) {
      throw new ApiError(409, "User With Username Or Email Is Exists");
    }
    // Multer Getting File Local Path
    // console.log(req.files)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.coverImage.length > 0
    ) {
      // Optional Check
      // coverImageLocalPath = req.files?.coverImage?.[0]?.path;
      // Mandate Check
      coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar File Is Required");
    }
    // Cloudinary Uploading
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!avatar) {
      throw new ApiError(400, "Avatar File Is Required");
    }
    // Creating User And Entry In DB
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      email,
      username: username.toLowerCase(),
      password,
      coverImage: coverImage?.url || "",
    });
  
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      throw new ApiError(500, "User Not Created");
    }
    // Response
    return res.status(201).json(
      new ApiResponse(
        200,
        {
          user: createdUser,
        },
        "User Registered Successfully"
      )
    );
  });
  

  const loginUser = asyncHandler(async(req,res) => {
    //req body -> data
    //username or email
    //find the user
    //password check
    //access and refresh token 
    //send cookie

    const {email,username,password} = req.body 
    console.log(email);
    //here is an alternative of above code based on logic discussed:
    //if(!(username || email))
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser, accessToken,refreshToken
            },
            "User logged In Successfully"
        )
    )
  })

  const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged out"))
  })
  
  const refreshAccessToken = asyncHandler(async(req,res)=> {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(! incomingRefreshToken){
      throw new ApiError(401,"unauthorized request")
    }

    try {
      const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = User.findById(decodedToken?._id)
  
      if(!user){
        throw new ApiError(401,"Invalid refresh token")
      }
  
      if(incomingRefreshToken !== user?.refreshtoken){
          throw new ApiError(401, "Refresh token is expired or used")
      }
  
      const options = {
        httpOnly:true,
        secure: true
      }
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken",newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {accessToken,refreshToken:newRefreshToken},"Access token refreshed"
        )
      )
    } catch (error) {
      throw new ApiError(401,error?.message||"Invalid refresh token")
    }
  })

  const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const{oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?.id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
      throw new ApiError(400,"Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
  })







export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}