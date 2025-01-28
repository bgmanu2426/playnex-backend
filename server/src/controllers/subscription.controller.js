import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route POST /api/v1/subscriptions/:channelId
 * @desc Subscribe or unsubscribe from a channel.
 * @param {Object} channelId - The ID of the channel to subscribe to.
 * @returns {Promise<void>} - A promise that resolves with a success message.
 * @throws {ApiError} - If the channel ID is invalid.
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;

        // Validate channelId
        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid Channel ID");
        }

        // Check if the channel exists
        const channel = await User.findById(channelId);
        if (!channel) {
            throw new ApiError(404, "Channel not found");
        }

        // Prevent user from subscribing to themselves
        if (channelId === req.user._id.toString()) {
            throw new ApiError(400, "You cannot subscribe to yourself");
        }

        // Check if subscription exists
        const existingSubscription = await Subscription.findOne({
            subscriber: req.user._id,
            channel: channelId,
        });

        if (existingSubscription) {
            // Unsubscribe
            await existingSubscription.deleteOne();

            return res
                .status(200)
                .json(new ApiResponse(200, "Unsubscribed successfully"));
        }

        // Subscribe
        const newSubscription = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId,
        });

        return res
            .status(201)
            .json(
                new ApiResponse(201, "Subscribed successfully", newSubscription)
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route GET /api/v1/subscriptions/my-subscribers
 * @desc Get list of subscribers for a channel
 * @returns {Promise<void>} - A promise that resolves with the subscribers.
 * @throws {ApiError} - If the user ID is invalid or the channel is not found.
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        // get user id from request object
        const userId = req.user?._id;

        // Validate userId (Optional)
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid User ID");
        }

        // Check if the channel exists (Optional)
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "Channel not found");
        }

        // Fetch subscribers
        const subscriptions = await Subscription.find({ channel: userId })
            .populate("subscriber", "fullName username avatar")
            .lean();

        const subscribers = subscriptions.map((sub) => sub.subscriber);

        // Count the total number of subscribers
        const totalSubscribers = await Subscription.countDocuments({
            channel: userId,
        });

        return res.status(200).json(
            new ApiResponse(200, "Subscribers fetched successfully", {
                subscribers,
                totalSubscribers,
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
 * @route GET /api/v1/subscriptions/my-subscriptions
 * @desc Get list of channels the user has subscribed to
 * @returns {Promise<void>} - A promise that resolves with the subscribed channels.
 * @throws {ApiError} - If the user ID is invalid or the user is not found.
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        // get user id from request object
        const userId = req.user?._id;

        // Validate userId (Optional)
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid User ID");
        }

        // Check if the user (channel) exists (Optional)
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Fetch subscribed channels
        const subscriptions = await Subscription.find({ subscriber: userId })
            .populate("channel", "fullName username avatar")
            .lean();

        const channels = subscriptions.map((sub) => sub.channel);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Subscribed channels fetched successfully",
                    channels
                )
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
