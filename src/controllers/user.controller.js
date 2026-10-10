import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRequestHandler.js";
import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

const getAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.getAccessToken();
        const refreshToken = user.getRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log("TOKEN ERROR:", error);
        throw new ApiError(
        500,
        "Something went wrong while generate access and refresh token"
    );
  }
}

const registerUser = AsyncHandler(async (req, res) => {
    // get user data from request body
    // validate user data
    // check if user already exists
    // create new user object
    // save user to database
    // send response with user data

    const {userName, email, password, fullName} = req.body

    if (
        [userName, email, password, fullName].some((field) => field.trim() === "")
    ){
        throw new ApiError(400, "All field are must be required")
    }

    const existingUser = await User.findOne({
        $or: [{userName}, {email}]
    })
    if(existingUser){
        throw new ApiError(401, "user is already exists")
    }

    const user = await User.create({
        fullName,
        userName : userName.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Internal server error while create user")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, createdUser, "create register user is successfully"))
});

const loginUser = AsyncHandler(async(req, res) => {
    // get user data
    // validate that data
    // check user exist or not
    // check password
    // send cookies and response msg

    const {userName, email, password} = req.body;

    // if(!(userName || email)){
    //     throw new ApiError(401, "Please enter a valid username or email")
    // }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if(!user){
        throw new ApiError(401, "username or email invalid")
    }

    const isPassword = await user.isPasswordCheck(password)

    if(!isPassword){
        throw new ApiError(401, "password is not correct please check it")
    }

    const {accessToken, refreshToken} = await getAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User login successfully"
        )
    )
});

const logoutUser = AsyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined,
            }
        },
        {
            new : true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "user logout successfully")
    )
});

const changePassword = AsyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCheck(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "successfully changed password")
    )
});

const refreshTokenAccess = AsyncHandler(async(req, res) => {
    // get refreshToken 
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingToken){
        throw new ApiError(400, "Invalid refresh token")
    }
    const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

    try {
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "unauthorize access refresh token")
        }
    
        if(incomingToken !== user?.refreshToken){
            throw new ApiError(400, "Invalid access for refresh token")
        }
    
        const {accessToken, newRefreshToken} = await getAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "successfully refreshed a refresh token"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something Went Wrong While Refreshed a RefreshToken")
    }
});
export { 
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    refreshTokenAccess
}