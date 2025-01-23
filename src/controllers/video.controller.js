import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
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
        if (!title && !description) {
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
            videoPublicId: videoFile.asset_id,
            thumbnail: thumbnail.secure_url,
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
    const { videoId } = req.params;

    try {
        if (!videoId || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid Video ID");
        }

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            $inc: { views: 1 },
        },
            { new: true }
        ).populate("owner", "username fullName avatar"); // populate is used to get the owner details from the User collection

        return res.status(200).json(
            new ApiResponse(200, "Video found", updatedVideo)
        );

    } catch (error) {
        console.log(error);
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );

    }
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
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
