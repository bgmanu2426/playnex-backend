import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import ApiResponse from "../utils/ApiResponse.js";

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
    if (!email || !username) {
        throw new ApiError(400, "Email or username is required");
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

export { registerUser, loginUser };
