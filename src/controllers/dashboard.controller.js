import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route GET /api/v1/dashboard/stats
 * @desc Get the channel stats like total video views, total subscribers, total videos, total likes etc.
 * @returns {Promise<void>} - A promise that resolves to the response object
 * @throws {ApiError} - If an error occurs while fetching channel stats
 */
const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;

        // Get total videos
        const totalVideos = await Video.countDocuments({ owner: userId });

        // Get total views
        const totalViews = await Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } },
        ]);

        // Get total subscribers
        const totalSubscribers = await Subscription.countDocuments({
            channel: userId,
        });

        // Get total likes
        const totalLikes = await Like.countDocuments({ likedBy: userId });

        res.status(200).json(
            new ApiResponse(200, "Channel stats fetched successfully", {
                totalVideos,
                totalViews: totalViews[0]?.totalViews || 0,
                totalSubscribers,
                totalLikes,
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
 * @route GET /api/v1/dashboard/videos
 * @desc Get all the videos uploaded by the channel
 * @returns {Promise<void>} - A promise that resolves to the response object
 * @throws {ApiError} - If an error occurs while fetching channel videos
 */
const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;

        // Get all videos uploaded by the channel
        const videos = await Video.find({ owner: userId });

        res.status(200).json(
            new ApiResponse(200, "Channel videos fetched successfully", videos)
        );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export { getChannelStats, getChannelVideos };
