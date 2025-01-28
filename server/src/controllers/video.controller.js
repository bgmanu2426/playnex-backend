import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    deleteVideoCloudinary,
    uploadOnCloudinary,
} from "../utils/fileUpload.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route   GET /api/v1/videos
 * @desc    Fetch all videos with pagination, sorting, and search.
 * @param   {Number} page The page number for pagination (default: 1).
 * @param   {Number} limit The number of videos per page (default: 10).
 * @param   {String} query The search query for video titles (optional).
 * @param   {String} sortBy The sorting order for videos (views, newest, older) (default: newest).
 * @returns {Promise<void>} A promise that resolves with the videos and pagination info.
 * @throws  {ApiError} If the query fails.
 */

const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, query, sortBy = "newest" } = req.query; // Pagination and sorting parameters

        // Define sorting options
        let sortOption;
        switch (sortBy.toLowerCase()) {
            case "views":
                sortOption = { views: -1 }; // Descending order of views
                break;
            case "older":
                sortOption = { createdAt: 1 }; // Ascending order of creation date
                break;
            case "newest":
            default:
                sortOption = { createdAt: -1 }; // Descending order of creation date
        }

        // Build the filter object based on the query
        const filter = {};
        if (query) {
            filter.title = { $regex: query, $options: "i" }; // Case-insensitive search on title
        }

        // Fetch videos with applied filters, sorting, and pagination
        const videos = await Video.find(filter)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .populate("owner", "fullName username avatar"); // Populate owner details

        // Get total count for pagination
        const totalVideos = await Video.countDocuments(filter);
        const totalPages = Math.ceil(totalVideos / limit);

        // Respond with videos and pagination info
        return res.status(200).json(
            new ApiResponse(200, "Videos fetched successfully", {
                videos,
                pagination: {
                    total: totalVideos,
                    page: Number(page),
                    limit: Number(limit),
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
 * @route   POST /api/v1/videos
 * @desc    Publishes a new video with a title, description, video file, and thumbnail.
 * @param   {String} title The title of the video.
 * @param   {String} description The description of the video.
 * @param   {Boolean} isPublished The publish status of the video (default: true).
 * @param   {File} videoFile The video file to upload.
 * @param   {File} thumbnail The thumbnail image to upload.
 * @returns {Promise<void>} A promise that resolves with the published video.
 * @throws  {ApiError} If the video file or thumbnail is missing or the upload fails.
 */

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished = true } = req.body;

    try {
        if ([title, description].map((field) => field.trim()).includes("")) {
            throw new ApiError(400, "Title and Description are required");
        }

        const videoFileLocalPath = req.files.videoFile[0].path;
        const thumbnailLocalPath = req.files.thumbnail[0].path;
        if (!videoFileLocalPath && !thumbnailLocalPath) {
            throw new ApiError(400, "Video file and Thumbnail are required");
        }

        const owner = req.user?._id;

        const videoFile = await uploadOnCloudinary(
            videoFileLocalPath,
            "videos"
        );
        const thumbnail = await uploadOnCloudinary(
            thumbnailLocalPath,
            "thumbnails"
        );

        if (!videoFile || !thumbnail) {
            throw new ApiError(500, "Failed to upload video or thumbnail");
        }

        // save video details in the database
        const video = await Video.create({
            videoFile: videoFile.secure_url,
            videoPublicId: videoFile.public_id,
            thumbnail: thumbnail.secure_url,
            thumbnailPublicId: thumbnail.public_id,
            title,
            description,
            duration: videoFile.duration,
            isPublished,
            owner,
        });

        if (!video) {
            throw new ApiError(500, "Failed to publish video");
        }

        return res
            .status(201)
            .json(new ApiResponse(201, "Video published successfully", video));
    } catch (error) {
        console.log(error);
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route   GET /api/v1/videos/:videoId
 * @desc    Fetches a video by its ID and increments the view count.
 * @param   {String} videoId The ID of the video to fetch.
 * @returns {Promise<void>} A promise that resolves with the video details.
 * @throws  {ApiError} If the video ID is invalid or the video is not found.
 */
const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        // TODO: Get the videos likes comments and also the users subscribers count

        if (
            [videoId].map((field) => field.trim()).includes("") ||
            !isValidObjectId(videoId)
        ) {
            throw new ApiError(400, "Invalid Video ID");
        }

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // increment the views count of the video
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $inc: { views: 1 },
            },
            { new: true }
        ).populate("owner", "username fullName avatar"); // populate is used to get the owner details from the User collection

        // Add the video ID to the current user's watch history without duplicates and prioritize it
        if (req.user?._id) {
            // 1. Remove the videoId if it already exists to prevent duplicates
            await User.findByIdAndUpdate(
                req.user._id,
                { $pull: { watchHistory: videoId } },
                { new: true }
            );

            // 2. Add the videoId to the beginning of the watchHistory array
            const updatedUser = await User.findByIdAndUpdate(
                req.user._id,
                { $push: { watchHistory: { $each: [videoId], $position: 0 } } },
                { new: true }
            );

            // 3. Trim the watchHistory array to keep only the first 100 entries
            if (updatedUser.watchHistory.length > 100) {
                updatedUser.watchHistory = updatedUser.watchHistory.slice(
                    0,
                    100
                );
                await updatedUser.save();
            }
        }

        return res
            .status(200)
            .json(new ApiResponse(200, "Video found", updatedVideo));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route   PATCH /api/v1/videos/:videoId
 * @desc    Updates a video's title, description, and thumbnail by its ID.
 * @param   {String} videoId The ID of the video to update.
 * @param   {String} title The new title of the video.
 * @param   {String} description The new description of the video.
 * @param   {File} thumbnail The new thumbnail image to upload.
 * @returns {Promise<void>} A promise that resolves with the updated video details.
 * @throws  {ApiError} If the video ID is invalid, the user is unauthorized, or the update fails.
 */

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        // Check if the owner id in the video is the same as the user id currently logged in

        const videoOwner = await Video.findById(videoId).select(
            "owner thumbnailPublicId"
        );

        if (!videoOwner) {
            throw new ApiError(404, "Video not found");
        }

        if (videoOwner.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const { title, description } = req.body;
        const thumbnailLocalPath = req.file.path;
        let thumbnail;
        if (thumbnailLocalPath) {
            thumbnail = await uploadOnCloudinary(
                thumbnailLocalPath,
                "thumbnails"
            );
            if (!thumbnail) {
                throw new ApiError(500, "Failed to upload thumbnail");
            }
        }

        // delete the old thumbnail from cloudinary
        const updateThumbnail = await deleteFromCloudinary(
            thumbnailPublicId?.thumbnailPublicId
        );

        if (updateThumbnail?.result !== "ok") {
            throw new ApiError(500, "Failed to update thumbnail");
        }

        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title,
                    description,
                    thumbnail: thumbnail?.secure_url,
                    thumbnailPublicId: thumbnail?.public_id,
                },
            },
            { new: true }
        );

        return res
            .status(200)
            .json(
                new ApiResponse(200, "Video updated successfully", updatedVideo)
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
 * @route   DELETE /api/v1/videos/:videoId
 * @desc    Deletes a video by its ID and removes it from Cloudinary.
 * @param   {String} videoId The ID of the video to delete.
 * @returns {Promise<void>} A promise that resolves with a success message.
 * @throws  {ApiError} If the video ID is invalid, the user is unauthorized, or the deletion fails.
 */
const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        // check if the owner id in the video is the same as the user id in the token if yes then only delete the video

        const videoOwner =
            await Video.findById(videoId).select("owner thumbnail");

        if (!videoOwner) {
            throw new ApiError(404, "Video not found");
        }

        if (videoOwner.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const video = await Video.findByIdAndDelete(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // delete the video file and thumbnail from cloudinary
        const delThumbnail = await deleteFromCloudinary(
            video.thumbnailPublicId
        );
        const delVideo = await deleteVideoCloudinary(video.videoPublicId);

        if (delThumbnail?.result !== "ok" || delVideo?.result !== "ok") {
            throw new ApiError(500, "Failed to delete video and thumbnail");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, "Video deleted successfully"));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route   PATCH /api/v1/videos/toggle-publish/:videoId
 * @desc    Toggles the publish status of a video by its ID.
 * @param   {String} videoId The ID of the video to update.
 * @returns {Promise<void>} A promise that resolves with the updated video details.
 * @throws  {ApiError} If the video ID is invalid, the user is unauthorized, or the update fails.
 */

const togglePublishStatus = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        // check if the owner id in the video is the same as the user id in the token if yes then only toggle the publish status

        const videoOwner =
            await Video.findById(videoId).select("owner isPublished");

        if (!videoOwner) {
            throw new ApiError(404, "Video not found");
        }

        if (videoOwner.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const video = await Video.findByIdAndUpdate(
            videoId,
            { $set: { isPublished: !videoOwner.isPublished } },
            { new: true }
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Publish status updated successfully",
                    video
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
 * @route   GET /api/v1/videos/u/videos
 * @desc    Fetch all videos by the currently logged-in user.
 * @param   {Number} page The page number for pagination (default: 1).
 * @param   {Number} limit The number of videos per page (default: 10).
 * @param   {String} sortType The sorting order for videos (desc, asc) (default: desc).
 * @returns {Promise<void>} A promise that resolves with the videos of the user.
 * @throws  {ApiError} If the user ID is invalid or the videos are not found.
 */

const getVideosByUserId = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortType = "desc" } = req.query;

    const sorting = sortType.toLowerCase() === "desc" ? -1 : 1;

    if (!isValidObjectId(req.user?._id)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const videos = await Video.find({ owner: req.user?._id })
        .sort({ createdAt: sorting }) // if sorting is -1 then it will sort in descending order if 1 then ascending order
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("owner", "username fullName avatar");

    return res.status(200).json(new ApiResponse(200, "Videos found", videos));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideosByUserId,
};
