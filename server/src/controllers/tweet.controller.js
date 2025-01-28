import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @desc    Create a new tweet
 * @route   POST /api/v1/tweets
 * @access  Private
 */
const createTweet = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;

        // Validate input
        if (!content || content.trim() === "") {
            throw new ApiError(400, "Tweet content cannot be empty");
        }

        // Create new tweet
        const tweet = await Tweet.create({
            content,
            author: req.user._id,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, "Tweet created successfully", tweet));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @desc    Get all tweets of a specific user with pagination
 * @route   GET /api/v1/tweets/u/:userId
 * @access  Public
 * @param   {string} userId - ID of the user whose tweets are to be fetched
 * @param   {number} [page=1] - Page number for pagination
 * @param   {number} [limit=10] - Number of tweets per page
 * @returns {Promise<void>}
 * @throws  {ApiError} - If userId is invalid or user not found
 */
const getUserTweets = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate userId
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid User ID");
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Convert page and limit to numbers
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Calculate total number of tweets
        const totalTweets = await Tweet.countDocuments({ author: userId });

        // Calculate total pages
        const totalPages = Math.ceil(totalTweets / limitNumber);

        // Fetch tweets with pagination and populate author details
        const tweets = await Tweet.find({ author: userId })
            .sort({ createdAt: -1 }) // Latest tweets first
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .populate("author", "fullName username avatar"); // Populate author details

        return res.status(200).json(
            new ApiResponse(200, "User tweets fetched successfully", {
                tweets,
                pagination: {
                    total: totalTweets,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages,
                },
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
 * @desc    Update a tweet
 * @route   PUT /api/v1/tweets/:tweetId
 * @access  Private
 */
const updateTweet = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;
        const { content } = req.body;

        // Validate tweetId
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid Tweet ID");
        }

        // Validate input
        if (!content || content.trim() === "") {
            throw new ApiError(400, "Tweet content cannot be empty");
        }

        // Find the tweet
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        // Check if the logged-in user is the author
        if (tweet.author.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Unauthorized to update this tweet");
        }

        // Update the tweet
        tweet.content = content;
        await tweet.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Tweet updated successfully", tweet));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @desc    Delete a tweet
 * @route   DELETE /api/v1/tweets/:tweetId
 * @access  Private
 */
const deleteTweet = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;

        // Validate tweetId
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid Tweet ID");
        }

        // Find the tweet
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        // Check if the logged-in user is the author
        if (tweet.author.toString() !== req.user._id.toString()) {
            throw new ApiError(401, "Unauthorized to delete this tweet");
        }

        // Delete the tweet
        await tweet.deleteOne();

        return res
            .status(200)
            .json(new ApiResponse(200, "Tweet deleted successfully"));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
