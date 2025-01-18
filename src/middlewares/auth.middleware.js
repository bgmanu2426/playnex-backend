import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const accessToken =
            req.cookies?.accessToken || req.headers["Authorization"]?.split(" ")[1];
            
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedJWT = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedJWT?._id);

        if (!user) {
            throw new ApiError(401, "Unauthorized Request");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized Request");
    }
});
