import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @desc Toggle like on a video
 * @route POST /api/v1/likes/toggle/v/:videoId
 * @access Private
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid Video ID");
        }

        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        let userLikes = await Like.findOne({ likedBy: req.user._id });
        if (!userLikes) {
            userLikes = await Like.create({ likedBy: req.user._id });
        }

        const index = userLikes.videos.indexOf(videoId);
        if (index >= 0) {
            userLikes.videos.splice(index, 1);
            await userLikes.save();
            return res.status(200).json(new ApiResponse(200, "Video unliked"));
        }

        userLikes.videos.push(videoId);
        await userLikes.save();
        res.status(201).json(new ApiResponse(201, "Video liked", userLikes));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @desc Toggle like on a comment
 * @route POST /api/v1/likes/toggle/c/:commentId
 * @access Private
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        if (!isValidObjectId(commentId)) {
            throw new ApiError(400, "Invalid Comment ID");
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        let userLikes = await Like.findOne({ likedBy: req.user._id });
        if (!userLikes) {
            userLikes = await Like.create({ likedBy: req.user._id });
        }

        const index = userLikes.comments.indexOf(commentId);
        if (index >= 0) {
            userLikes.comments.splice(index, 1);
            await userLikes.save();
            return res.status(200).json(new ApiResponse(200, "Comment unliked"));
        }

        userLikes.comments.push(commentId);
        await userLikes.save();
        res.status(201).json(new ApiResponse(201, "Comment liked", userLikes));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @desc Toggle like on a tweet
 * @route POST /api/v1/likes/toggle/t/:tweetId
 * @access Private
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid Tweet ID");
        }

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        let userLikes = await Like.findOne({ likedBy: req.user._id });
        if (!userLikes) {
            userLikes = await Like.create({ likedBy: req.user._id });
        }

        const index = userLikes.tweets.indexOf(tweetId);
        if (index >= 0) {
            userLikes.tweets.splice(index, 1);
            await userLikes.save();
            return res.status(200).json(new ApiResponse(200, "Tweet unliked"));
        }

        userLikes.tweets.push(tweetId);
        await userLikes.save();
        res.status(201).json(new ApiResponse(201, "Tweet liked", userLikes));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @desc Get all liked videos by the current user
 * @route GET /api/v1/likes/videos
 * @access Private
 */
const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        const userLikes = await Like.findOne({ likedBy: req.user._id })
            .populate("videos");

        // Return an empty array if the user has no like document
        const likedVideos = userLikes?.videos || [];
        return res
            .status(200)
            .json(new ApiResponse(200, "Liked videos fetched", likedVideos));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };