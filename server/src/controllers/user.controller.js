import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/fileUpload.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import DATA from "../config.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Save the generated refresh token to the database
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
};

/**
 * @route POST /api/v1/auth/register
 * @desc Registers a new user
 * @param {string} fullName - The full name of the user
 * @param {string} username - The username of the user
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @param {File} avatar - The avatar of the user
 * @param {File} coverImage - The cover image of the user (optional)
 * @returns {Promise<void>} - A promise that resolves with the created user
 * @throws {ApiError} - If registration fails
 */
const registerUser = asyncHandler(async (req, res) => {
    try {
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

        const passwordRegex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        );
        if (!passwordRegex.test(password)) {
            throw new ApiError(
                400,
                "Password should be at least 8 characters long, and contain at least one uppercase, one lowercase, one digit, and one special character"
            );
        }

        // Check if the user already exists in the database : username or email
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });

        if (existingUser) {
            throw new ApiError(409, "User already exists");
        }

        // if images exist, upload to cloudinary
        let coverImageLocalPath;
        if (
            req.files &&
            Array.isArray(req.files.coverImage) &&
            req.files.coverImage.length > 0
        ) {
            coverImageLocalPath = req.files.coverImage[0].path;
        }

        const avatarLocalPath = req.files?.avatar[0]?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath, "avatar"); // upload the avatar to cloudinary
        const coverImage = await uploadOnCloudinary(
            coverImageLocalPath,
            "coverImage"
        ); // upload the cover image to cloudinary

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
            avatarPublicId: avatar.public_id,
            coverImage: coverImage?.secure_url || "",
            coverImagePublicId: coverImage?.public_id || "",
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
            .json(
                new ApiResponse(201, "User created successfully", createdUser)
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route POST /api/v1/auth/login
 * @desc Logs in a user
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<void>} - A promise that resolves with the logged in user
 * @throws {ApiError} - If login fails or user not found
 */
const loginUser = asyncHandler(async (req, res) => {
    try {
        // Get the required user data from the request body
        const { email, password } = req.body;

        // Forms validation - Check for not empty, valid email, password length
        if (!email) {
            throw new ApiError(400, "Email is required");
        } else if (!password) {
            throw new ApiError(400, "Password is required");
        }

        const passwordRegex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        );
        if (!passwordRegex.test(password)) {
            throw new ApiError(
                400,
                "Password should be at least 8 characters long, and contain at least one uppercase, one lowercase, one digit, and one special character"
            );
        }

        // Find the user in the database by email
        const user = await User.findOne({
            $or: [{ email }],
        });

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
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user._id);

        // Send cookies with access token and refresh token and return the response
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, "User LoggedIn Successfully", {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                })
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route POST /api/v1/auth/logout
 * @desc Logs out a user
 * @returns {Promise<void>} - A promise that resolves with a success message
 * @throws {ApiError} - If logout fails or user not found
 */
const logoutUser = asyncHandler(async (req, res) => {
    // Clear the cookies and refresh token from the database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1, // this removes the field from document
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User Logged Out Successfully"));
});

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc Refreshes the access token
 * @returns {Promise<void>} - A promise that resolves with the new access token
 * @throws {ApiError} - If refresh token is invalid or user not found
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get the refresh token from the request cookies
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    // Check if the refresh token exists
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        // Verify the refresh token which returns the user id
        const decoded = jwt.verify(
            incomingRefreshToken,
            DATA.tokens.refreshTokenSecret
        );

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

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshTokens(user?._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, "Access Token Refreshed Successfully", {
                    accessToken,
                    refreshToken,
                })
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route PATCH /api/v1/auth/change-password
 * @desc Changes the current user password
 * @param {string} currentPassword - The current password of the user
 * @param {string} newPassword - The new password of the user
 * @returns {Promise<void>} - A promise that resolves with a success message
 * @throws {ApiError} - If password change fails
 */
const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
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
        const passwordRegex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
        );
        if (!passwordRegex.test(newPassword)) {
            throw new ApiError(
                400,
                "Password should be at least 8 characters long, and contain at least one uppercase, one lowercase, one digit, and one special character"
            );
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
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route GET /api/v1/auth/me
 * @desc Retrieves the current user
 * @returns {Promise<void>} - A promise that resolves with the current user
 * @throws {ApiError} - If user retrieval fails
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        // return the response
        return res
            .status(200)
            .json(new ApiResponse(200, "User found", req.user));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route PATCH /api/v1/auth/update-account
 * @desc Updates the user's account details
 * @param {string} fullName - The full name of the user
 * @param {string} email - The email of the user
 * @returns {Promise<void>} - A promise that resolves with the updated user
 * @throws {ApiError} - If account update fails
 */
const updateAccountDetails = asyncHandler(async (req, res) => {
    try {
        const { fullName, email } = req.body; // Get the required user data from the request body

        // Forms validation - Check for not empty, valid email or full name
        if ([fullName, email].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "Full name or email are required");
        }

        // Check if the user already exists in the database and update the full name or email
        const updateduser = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullName,
                    email,
                },
            },
            { new: true }
        ).select("-password -refreshToken");

        // return the response
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Account details updated successfully",
                    updateduser
                )
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route PATCH /api/v1/auth/update-avatar
 * @desc Updates the user's avatar
 * @param {File} avatar - The avatar of the user to be updated
 * @returns {Promise<void>} - A promise that resolves with the updated user
 * @throws {ApiError} - If avatar update fails
 */
const updateUserAvatar = asyncHandler(async (req, res) => {
    try {
        // if images exist, and upload to cloudinary
        const avatarLocalPath = req.file?.path;
        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar is required");
        }

        // Delete the old avatar from cloudinary
        const oldAvatarPublicID = await User.findById(req.user?._id).select(
            "avatarPublicId"
        );
        const deleteAvatar = await deleteFromCloudinary(
            oldAvatarPublicID?.avatarPublicId
        );

        if (deleteAvatar?.result !== "ok") {
            throw new ApiError(500, "Avatar delete failed");
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
                    avatarPublicId: avatar.public_id || "",
                },
            },
            { new: true }
        ).select("-password -refreshToken");

        // return the response
        return res
            .status(200)
            .json(
                new ApiResponse(200, "User avatar updated successfully", user)
            );
    } catch (error) {
        console.log(error);
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route PATCH /api/v1/auth/update-cover-image
 * @desc Updates the user's cover image
 * @param {File} coverImage - The cover image of the user to be updated
 * @returns {Promise<void>} - A promise that resolves with the updated user
 * @throws {ApiError} - If cover image update fails
 */
const updateUserCoverImage = asyncHandler(async (req, res) => {
    try {
        // if images exist, and upload to cloudinary
        const coverImagePath = req.file?.path;

        if (!coverImagePath) {
            throw new ApiError(400, "Cover image is required");
        }

        // Delete the old cover image from cloudinary
        const oldCoverImagePublicId = await User.findById(req.user?._id).select(
            "coverImagePublicId"
        );

        console.log(oldCoverImagePublicId?.coverImagePublicId);

        const deleteCoverImage = await deleteFromCloudinary(
            oldCoverImagePublicId?.coverImagePublicId
        );

        if (deleteCoverImage?.result !== "ok") {
            throw new ApiError(500, "Cover image delete failed");
        }

        const coverImage = await uploadOnCloudinary(
            coverImagePath,
            "coverImage"
        ); // upload the avatar to cloudinary

        if (!coverImage) {
            throw new ApiError(500, "Cover image upload failed");
        }

        // Create a new user object and check if the user is saved to the database
        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    coverImage: coverImage.secure_url || "",
                    coverImagePublicId: coverImage.public_id || "",
                },
            },
            { new: true }
        ).select("-password -refreshToken");

        // return the response
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "User cover image updated successfully",
                    user
                )
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route GET /api/v1/users/channel/:username
 * @desc Retrieves a user's channel profile
 * @param {string} username - The username of the channel
 * @returns {Promise<void>} - A promise that resolves with the user's channel profile
 * @throws {ApiError} - If channel retrieval fails
 */
const getUserChannelProfile = asyncHandler(async (req, res) => {
    try {
        const { username } = req.params;

        if (!username?.trim()) {
            throw new ApiError(400, "Channel username is invalid");
        }

        const channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase(),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                },
            },
            {
                $addFields: {
                    totalSubscribers: { $size: "$subscribers" },
                    totalSubscribedTo: { $size: "$subscribedTo" },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    totalSubscribers: 1,
                    totalSubscribedTo: 1,
                    isSubscribed: 1,
                },
            },
        ]);

        if (!channel?.length) {
            throw new ApiError(404, "Channel not found");
        }

        res.status(200).json(new ApiResponse(200, "Channel found", channel[0]));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route GET /api/v1/users/watch-history
 * @desc Retrieves the user's watch history
 * @returns {Promise<void>} - A promise that resolves with the user's watch history
 * @throws {ApiError} - If watch history retrieval fails
 */
const getWatchHistory = asyncHandler(async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id),
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchedVideosHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "channelOwner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                channelOwner: {
                                    $first: "$channelOwner",
                                },
                            },
                        },
                    ],
                },
            },
        ]);

        res.status(200).json(
            new ApiResponse(
                200,
                "Users watch history fetched successfully",
                user[0]?.watchedVideosHistory
            )
        );
    } catch (error) {
        throw new ApiError(500, error.message);
    }
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
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
