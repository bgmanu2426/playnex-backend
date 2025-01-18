import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save the generated refresh token to the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get the required user data from the request body
    const { fullName, username, email, password } = req.body;
    // console.log(fullName, username, email, password);

    // Forms validation - Check for not empty, valid email, password length
    // if (
    //     [fullName, username, email].some((field) => field?.trim() === "")
    // ) {
    //     throw new ApiError(400, "All fields are required");
    // }

    if (!fullName) {
        throw new ApiError(400, "Full name is required");
    } else if (!username) {
        throw new ApiError(400, "Username is required");
    } else if (!email) {
        throw new ApiError(400, "Email is required");
    }


    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    if (!passwordRegex.test(password)) {
        throw new ApiError(400, "Password should be at least 8 characters long, and contain at least one uppercase, one lowercase, one digit, and one special character");
    }

    // Check if the user already exists in the database : username, email
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // if images exist, and upload to cloudinary
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar"); // upload the avatar to cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "coverImage"); // upload the cover image to cloudinary

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // Create a new user object and check if the user is saved to the database
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
    });

    // remove the sensitive data from the user object like password, refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    // return the response
    return res
        .status(201)
        .json(new ApiResponse(201, "User created successfully", createdUser));
});


const loginUser = asyncHandler(async (req, res) => {
    // Get the required user data from the request body
    const { email, username, password } = req.body;

    // Forms validation - Check for not empty, valid email, password length
    if (!email && !username) {
        throw new ApiError(400, "Email or Username is required");
    } else if (!password) {
        throw new ApiError(400, "Password is required");
    }


    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    if (!passwordRegex.test(password)) {
        throw new ApiError(400, "Password should be at least 8 characters long, and contain at least one uppercase, one lowercase, one digit, and one special character");
    }

    // Find the user in the database by email
    const user = await User.findOne({
        $or: [{ email }, { username }],
    })

    // Check if the user exists in the database
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Compare the password with the one in the database
    const verifyPassword = await user.isPasswordCorrect(password);
    if (!verifyPassword) {
        throw new ApiError(401, "Invalid user Credentials");
    }

    // Generate access token and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Send cookies with access token and refresh token and return the response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

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
                "User LoggedIn Successfully",
                {
                    user: loggedInUser, accessToken, refreshToken
                }
            ))
});

const logoutUser = asyncHandler(async (req, res) => {
    // Clear the cookies and refresh token from the database
    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(200, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get the refresh token from the request cookies
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // Check if the refresh token exists
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        // Verify the refresh token which returns the user id
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Find the user in the database by id
        const user = await User.findById(decoded?._id);

        // Check if the user exists in the database
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Compare the refresh token with the one in the database
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user?._id);

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
                    "Access Token Refreshed Successfully",
                    {
                        accessToken, refreshToken
                    }
                ));
    } catch (error) {
        throw new ApiError(401, error.message);
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body; // Get the required user data from the request body

    // if (newPassword !== confirmPassword) {
    //     throw new ApiError(400, "Passwords do not match");
    // }

    // Forms validation - Check for not empty, valid email, password length
    if (!currentPassword) {
        throw new ApiError(400, "Current Password is required");
    } else if (!newPassword) {
        throw new ApiError(400, "New Password is required");
    }

    // Check if the new password meets the required criteria
    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})");
    if (!passwordRegex.test(newPassword)) {
        throw new ApiError(400, "Password should be at least 8 characters long, and contain at least one uppercase, one lowercase, one digit, and one special character");
    }

    // Find the user in the database by id
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid current password");
    }

    user.password = newPassword;

    // Save the updated user object to the database
    await user.save({ validateBeforeSave: false });

    // return the response
    return res
        .status(200)
        .json(new ApiResponse(200, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    // return the response
    return res
        .status(200)
        .json(new ApiResponse(200, "User found", req.user));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body; // Get the required user data from the request body

    // Forms validation - Check for not empty, valid email or full name
    if (!fullName || !email) {
        throw new ApiError(400, "Full name or email are required");
    }

    // Check if the user already exists in the database : username, email
    const updateduser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        }, { new: true }
    ).select("-password -refreshToken");

    // return the response
    return res
        .status(200)
        .json(new ApiResponse(200, "Account details updated successfully", updateduser));
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    // if images exist, and upload to cloudinary
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar"); // upload the avatar to cloudinary

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    // Create a new user object and check if the user is saved to the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.secure_url || "",
            }
        }
        , { new: true }
    ).select("-password -refreshToken");

    // return the response
    return res
        .status(200)
        .json(new ApiResponse(200, "User avatar updated successfully", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {

    // if images exist, and upload to cloudinary
    const coverImagePath = req.file?.path;
    if (!coverImagePath) {
        throw new ApiError(400, "Cover image is required");
    }

    const coverImage = await uploadOnCloudinary(coverImagePath, "avatar"); // upload the avatar to cloudinary

    if (!coverImage) {
        throw new ApiError(500, "Cover image upload failed");
    }

    // Create a new user object and check if the user is saved to the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.secure_url || "",
            }
        }
        , { new: true }
    ).select("-password -refreshToken");

    // return the response
    return res
        .status(200)
        .json(new ApiResponse(200, "User cover image updated successfully", user));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};