import rateLimit from "express-rate-limit";
import requestIp from "request-ip";
import ApiError from "../utils/ApiError.js";

/**
 * @desc Middleware to configure rate limiting based on hours and minutes and extract the user's IP address.
 * @param {number} hours - The number of hours for the rate limit window.
 * @param {number} minutes - The number of minutes for the rate limit window. (Default is 1 minute)
 * @param {number} maxRequests - The maximum number of requests allowed per window.
 * @returns {Function} A middleware function that applies rate limiting based on the user's IP address.
 */
const createRateLimiterWithIp = (hours, minutes = 1, maxRequests) => {
    const windowMs = (hours * 60 + minutes) * 60 * 1000; // Convert hours and minutes to milliseconds

    const limiter = rateLimit({
        windowMs,
        max: maxRequests,
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        keyGenerator: (req, res) => {
            return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
        },
        handler: (_, __, ___, options) => {
            throw new ApiError(
                options.statusCode || 500,
                `There are too many requests. You are only allowed ${
                    options.max
                } requests per ${options.windowMs / 60000} minutes`
            );
        },
    });

    return (req, res, next) => {
        const clientIp = requestIp.getClientIp(req); // Get the client's IP address
        req.clientIp = clientIp; // Add the IP address to the request object
        limiter(req, res, next); // Apply the rate limiter
    };
};

export default createRateLimiterWithIp;
