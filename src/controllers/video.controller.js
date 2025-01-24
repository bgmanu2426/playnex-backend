import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, deleteVideoCloudinary, uploadOnCloudinary } from "../utils/fileUpload.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query; // Page and limit are used for pagination and they are optional parameters
    //TODO: get all videos based on query, sort, pagination


});

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

        const owner = req.user?._id

        const videoFile = await uploadOnCloudinary(videoFileLocalPath, "videos");
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnails");

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

        return res.status(201).json(
            new ApiResponse(201, "Video published successfully", video)
        );

    } catch (error) {
        console.log(error);
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        if ([videoId].map((field) => field.trim()).includes("")) {
            throw new ApiError(400, "Invalid Video ID");
        }

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // increment the views count of the video
        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
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
                updatedUser.watchHistory = updatedUser.watchHistory.slice(0, 100);
                await updatedUser.save();
            }
        }

        return res.status(200).json(
            new ApiResponse(200, "Video found", updatedVideo)
        );

    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { title, description } = req.body;
        const thumbnailLocalPath = req.file.path;
        let thumbnail;
        if (thumbnailLocalPath) {
            thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnails");
            if (!thumbnail) {
                throw new ApiError(500, "Failed to upload thumbnail");
            }
        }

        // delete the old thumbnail from cloudinary
        const thumbnailPublicId = await Video.findById(videoId).select("thumbnailPublicId");
        const updateThumbnail = await deleteFromCloudinary(thumbnailPublicId?.thumbnailPublicId);

        if (updateThumbnail?.result !== "ok") {
            throw new ApiError(500, "Failed to update thumbnail");
        }

        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            $set: {
                title,
                description,
                thumbnail: thumbnail?.secure_url,
                thumbnailPublicId: thumbnail?.public_id,
            }
        },
            { new: true }
        );

        return res.status(200).json(
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

const deleteVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        // check if the owner id in the video is the same as the user id in the token if yes then only delete the video

        const videoOwner = await Video.findById(videoId).select("owner thumbnail");

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
        const delThumbnail = await deleteFromCloudinary(video.thumbnailPublicId);
        const delVideo = await deleteVideoCloudinary(video.videoPublicId);

        if (delThumbnail?.result !== "ok" || delVideo?.result !== "ok") {
            throw new ApiError(500, "Failed to delete video and thumbnail");
        }

        return res.status(200).json(
            new ApiResponse(200, "Video deleted successfully")
        );

    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );

    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
