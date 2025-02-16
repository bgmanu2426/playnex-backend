import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @route GET /api/v1/comments/:videoId
 * @desc Get all comments for a specific video
 * @param {string} videoId - The ID of the video
 * @param {number} page - The page number for pagination (default: 1)
 * @param {number} limit - The number of comments per page (default: 10)
 * @returns {Promise<void>} - A promise that resolves to the response object
 * @throws {ApiError} - If an error occurs while fetching comments
 */
const getVideoComments = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate videoId
        if (!mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid Video ID");
        }

        // Check if the video exists
        const videoExists = await Video.findById(videoId);
        if (!videoExists) {
            throw new ApiError(404, "Video not found");
        }

        // Pagination calculations
        const skip = (Number(page) - 1) * Number(limit);
        const totalComments = await Comment.countDocuments({ video: videoId });
        const totalPages = Math.ceil(totalComments / limit);

        // Fetch comments with pagination and populate owner details
        const comments = await Comment.find({ video: videoId })
            .sort({ createdAt: -1 }) // Latest comments first
            .skip(skip)
            .limit(Number(limit))
            .populate("owner", "fullName username avatar"); // Populate comment author details

        return res.status(200).json(
            new ApiResponse(200, "Comments fetched successfully", {
                comments,
                pagination: {
                    total: totalComments,
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
 * @route POST /api/v1/comments/:videoId
 * @desc Add a new comment to a video
 * @param {string} videoId - The ID of the video
 * @param {string} content - The content of the comment
 * @returns {Promise<void>} - A promise that resolves to the response object
 * @throws {ApiError} - If an error occurs while adding the comment
 */
const addComment = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { content } = req.body;

        // Validate input
        if (!content || !content.trim()) {
            throw new ApiError(400, "Comment content is required");
        }

        // Validate videoId
        if (!mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid Video ID");
        }

        // Check if the video exists
        const videoExists = await Video.findById(videoId);
        if (!videoExists) {
            throw new ApiError(404, "Video not found");
        }

        // Create and save the new comment
        const comment = await Comment.create({
            content: content.trim(),
            video: videoId,
            owner: req.user._id,
        });

        if (!comment) {
            throw new ApiError(500, "Failed to add comment");
        }

        // Optionally, you can populate the owner details before sending the response
        await comment.populate("owner", "fullName username avatar");

        return res
            .status(201)
            .json(new ApiResponse(201, "Comment added successfully", comment));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @route PATCH /api/v1/comments/:commentId
 * @desc Edit an existing comment
 * @param {string} commentId - The ID of the comment
 * @param {string} content - The new content of the comment
 * @returns {Promise<void>} - A promise that resolves to the response object
 * @throws {ApiError} - If an error occurs while editing the comment
 */
const editComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        // Validate input
        if (!content || !content.trim()) {
            throw new ApiError(400, "Comment content is required");
        }

        // Validate commentId
        if (!mongoose.isValidObjectId(commentId)) {
            throw new ApiError(400, "Invalid Comment ID");
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Check if the logged-in user is the owner of the comment
        if (comment.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(401, "Unauthorized to edit this comment");
        }

        // Update the comment content
        comment.content = content.trim();
        await comment.save();

        // Optionally, populate the owner details before sending the response
        await comment.populate("owner", "fullName username avatar");

        return res
            .status(200)
            .json(
                new ApiResponse(200, "Comment updated successfully", comment)
            );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * Delete a comment
 * @route DELETE /api/v1/comments/:commentId
 * @desc Delete a comment
 * @param {string} commentId - The ID of the comment
 * @returns {Promise<void>} - A promise that resolves to the response object
 * @throws {ApiError} - If an error occurs while deleting the comment
 */
const deleteComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;

        // Validate commentId
        if (!mongoose.isValidObjectId(commentId)) {
            throw new ApiError(400, "Invalid Comment ID");
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }

        // Check if the logged-in user is the owner of the comment
        if (comment.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(401, "Unauthorized to delete this comment");
        }

        // Delete the comment
        await comment.deleteOne();

        return res
            .status(200)
            .json(new ApiResponse(200, "Comment deleted successfully"));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export { getVideoComments, addComment, editComment, deleteComment };
