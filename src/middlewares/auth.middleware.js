import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import DATA from "../config.js";

/**
 * Middleware to verify JWT token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @throws {ApiError} - If the token is invalid or user is not found
 */
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken =
            req.cookies?.accessToken ||
            req.headers["Authorization"]?.split(" ")[1];

        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedJWT = jwt.verify(
            accessToken,
            DATA.tokens.accessTokenSecret
        );

        const user = await User.findById(decodedJWT?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Unauthorized Request");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized Request");
    }
});
