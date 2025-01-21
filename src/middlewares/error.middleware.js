import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

/**
 * Global error handling middleware
 * @param {Error} err - The error object
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 */
const errorMiddleware = (err, req, res, next) => {
    if (!(err instanceof ApiError)) {
        console.error(err); // Log the error for debugging
        err = new ApiError(500, err.message || "Internal Server Error");
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    const data = err.data || null;
    const errors = err.errors || [];

    res.status(statusCode).json(
        new ApiResponse(statusCode, message, data, errors)
    );
};

export default errorMiddleware;
