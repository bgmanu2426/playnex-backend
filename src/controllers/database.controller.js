import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { deleteAllFilesFromCloudinary } from "../utils/fileUpload.js";

/**
 * @desc    Empty the entire database by deleting all documents from all collections
 * @route   DELETE /api/v1/database/empty
 * @access  Public
 */
const emptyDatabase = asyncHandler(async (req, res) => {
    try {
        const collections = mongoose.connection.collections;

        // Iterate over each collection and delete all documents
        for (const key in collections) {
            if (Object.prototype.hasOwnProperty.call(collections, key)) {
                await collections[key].deleteMany({});
            }
        }

        // Delete all the resources from the cloudinary
        await deleteAllFilesFromCloudinary();

        return res.status(200).json(
            new ApiResponse(200, "Database emptied successfully")
        );
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Failed to empty the database"
        );
    }
});

export { emptyDatabase };