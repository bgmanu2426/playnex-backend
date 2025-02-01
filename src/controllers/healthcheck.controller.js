import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @route GET /api/v1/healthcheck
 * @desc Healthcheck endpoint to verify that the server is running.
 * @returns {Object} 200 - An ApiResponse object with status 200 and message "OK"
 */
const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, "OK"));
});

export { healthcheck };
