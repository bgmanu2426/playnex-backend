import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * @function createPlaylist
 * @description Creates a new playlist for the authenticated user.
 * @param {Object} req Express request object containing user details and playlist information.
 * @param {Object} res Express response object.
 */
const createPlaylist = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body;

        if ([title, description].map((field) => field.trim()).includes("")) {
            throw new ApiError(400, "Playlist name is required");
        }

        // Creates a new playlist document in the database
        const playlist = await Playlist.create({
            title,
            description,
            owner: req.user?._id,
        });

        res.status(201).json(
            new ApiResponse(201, "Playlist created", playlist)
        );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @function getUserPlaylists
 * @description Retrieves all playlists for a specific user.
 * @param {Object} req Express request object containing userId in params.
 * @param {Object} res Express response object.
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }

        // Fetches playlists belonging to the given user ID
        const playlists = await Playlist.find({ owner: userId });

        res.status(200).json(
            new ApiResponse(200, "User playlists fetched", playlists)
        );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @function getPlaylistById
 * @description Retrieves a single playlist by its ID and populates its videos.
 * @param {Object} req Express request object containing playlistId in params.
 * @param {Object} res Express response object.
 */
const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;

        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }

        // Finds the playlist by its ID and populates the "videos" field
        const playlist = await Playlist.findById(playlistId).populate("videos");
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        res.status(200).json(
            new ApiResponse(200, "Playlist fetched", playlist)
        );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @function addVideoToPlaylist
 * @description Adds a video to a playlist if it is not already included.
 * @param {Object} req Express request object containing playlistId and videoId in params.
 * @param {Object} res Express response object.
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid IDs");
        }

        // Finds the specified playlist
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        // Checks if the owner of the playlist and current user matches
        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }

        // Adds the video to the playlist if not already present
        if (!playlist.videos.includes(videoId)) {
            playlist.videos.push(videoId);
            await playlist.save();
        }

        res.status(200).json(
            new ApiResponse(200, "Video added to playlist", playlist)
        );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @function removeVideoFromPlaylist
 * @description Removes a video from a playlist if it exists in the playlist.
 * @param {Object} req Express request object containing playlistId and videoId in params.
 * @param {Object} res Express response object.
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid IDs");
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        // Checks if the owner of the playlist and current user matches
        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }

        // Filters out the specified video from the playlist
        playlist.videos = playlist.videos.filter(
            (v) => v.toString() !== videoId
        );
        await playlist.save();

        res.status(200).json(
            new ApiResponse(200, "Video removed from playlist", playlist)
        );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @function deletePlaylist
 * @description Deletes a playlist by its ID.
 * @param {Object} req Express request object containing playlistId in params.
 * @param {Object} res Express response object.
 */
const deletePlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;

        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        // Checks if the owner of the playlist and current user matches
        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }

        await playlist.deleteOne();
        res.status(200).json(new ApiResponse(200, "Playlist deleted", null));
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

/**
 * @function updatePlaylist
 * @description Updates playlist details such as name and description.
 * @param {Object} req Express request object containing playlistId in params and new data in body.
 * @param {Object} res Express response object.
 */
const updatePlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { title, description } = req.body;

        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }

        // Finds the playlist by its ID
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        // Checks if the owner of the playlist and current user matches
        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "Unauthorized access");
        }

        // Updates the playlist with the new data
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { title, description },
            { new: true }
        );

        res.status(200).json(
            new ApiResponse(200, "Playlist updated", updatedPlaylist)
        );
    } catch (error) {
        throw new ApiError(
            error?.statusCode || 500,
            error?.message || "Internal Server Error"
        );
    }
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
