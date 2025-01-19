import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const DATA = {
    port: process.env.PORT || 8000,
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
