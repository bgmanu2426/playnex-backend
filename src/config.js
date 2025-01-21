import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

/**
 * Configuration object containing environment variables
 * @type {Object}
 * @property {number} port - The port number (used in development)
 * @property {string} server_url - The server URL
 * @property {string} client_url - The client URL
 * @property {Object} cloudinary - Cloudinary configuration
 * @property {string} cloudinary.cloud_name - Cloudinary cloud name
 * @property {string} cloudinary.api_key - Cloudinary API key
 * @property {string} cloudinary.api_secret - Cloudinary API secret
 * @property {Object} database - Database configuration
 * @property {string} database.name - Database name
 * @property {string} database.uri - Database URI
 * @property {Object} tokens - Token configuration
 * @property {string} tokens.accessTokenSecret - Access token secret
 * @property {string} tokens.accessTokenExpiration - Access token expiration
 * @property {string} tokens.refreshTokenSecret - Refresh token secret
 * @property {string} tokens.refreshTokenExpiration - Refresh token expiration
 */
const DATA = {
    port: process.env.PORT,
    server_url: process.env.SERVER_URL || "http://localhost:8000",
    client_url: process.env.CLIENT_URL,
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    database: {
        name: process.env.DB_NAME,
        uri: process.env.MONGO_URI,
    },
    tokens: {
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        accessTokenExpiration: process.env.ACCESS_TOKEN_EXPIRY,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        refreshTokenExpiration: process.env.REFRESH_TOKEN_EXPIRY,
    },
};

export default DATA;
