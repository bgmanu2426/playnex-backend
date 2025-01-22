import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerjsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import DATA from "./config.js";

// Import routes
import userRoutes from "./routes/user.route.js";
import videoRoutes from "./routes/video.route.js";
import commentRoutes from "./routes/comment.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import playlistRoutes from "./routes/playlist.route.js";
import healthCheckRoutes from "./routes/healthcheck.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import tweetRoutes from "./routes/tweet.route.js";
import databaseRoutes from "./routes/database.route.js";

const app = express();

// CORS Middleware
app.use(
    cors({
        origin: DATA.client_url,
        credentials: true,
    })
);

// Body Parsing Middleware
app.use(
    express.json({
        limit: "12kb",
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "12kb",
    })
);

app.use(express.static("public")); // Serve static files
app.use(cookieParser()); // Parse cookies

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Youtube Clone API",
            description: "Youtube Clone API Information for developers",
            contact: {
                name: "Lakshminarayana",
            },
        },
        servers: [
            {
                url: "http://localhost:8000/api/v1",
            },
        ],
    },
    apis: ["./src/routes/*.js"], // Path to the API docs
};

const swaggerDocs = swaggerjsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/tweets", tweetRoutes);
app.use("/api/v1/database", databaseRoutes); // Use the new database routes

// Global Error Handling Middleware
// import errorMiddleware from "./middlewares/error.middleware.js";
// app.use(errorMiddleware);

/**
 * Express application instance
 * @module app
 */
export { app };