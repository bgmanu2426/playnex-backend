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
import likeRoutes from "./routes/like.route.js";
import databaseRoutes from "./routes/database.route.js";

// Import error middleware
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Initialize all the middlewares
app.use(
    cors({
        origin: DATA.client_url,
        credentials: true,
    })
);

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

// Define routes
app.use("/api/v1/healthcheck", healthCheckRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/tweets", tweetRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/database", databaseRoutes); // Use the new database routes

/**
 * Configure Swagger options at end of all the routes and middlewares to avoid conflicts
 */
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.3",
        info: {
            title: "PlayNex API's",
            description:
                "PlayNex is an video streaming application or simply an youtube application clone, which is used to stream the videos using the cloud utility cloudinary.",
            contact: {},
            version: "1.0.0",
        },
        tags: [
            {
                name: "🔐 Authentication",
                description: "Endpoints related to user authentication",
            },
            {
                name: "👤 User Managment",
                description: "Endpoints related to user management",
            },
            {
                name: "📹 Videos",
                description: "Endpoints related to video management",
            },
            {
                name: "📺 Subscriptions",
                description: "Endpoints related to subscriptions",
            },
            {
                name: "👍 Likes",
                description: "Endpoints related to likes",
            },
            {
                name: "🗨️ Comments",
                description: "Endpoints related to comments",
            },
            {
                name: "🐦 Tweets",
                description: "Endpoints related to tweets",
            },
            {
                name: "🎞️ Playlists",
                description: "Endpoints related to playlists",
            },
            {
                name: "❌ Danger Zone",
                description: "Endpoints related to emptying the database",
            },
            {
                name: "✅ Healthcheck",
                description: "Endpoints related to health check",
            },
        ],
        servers: [
            {
                url: `${DATA.server_url}/api/v1`,
            },
        ],
    },
    apis: ["./src/routes/*.js"], // Path to the API docs
};

const swaggerUiOptions = {
    customSiteTitle: "PlayNex API Docs",
    swaggerOptions: {
        docExpansion: "none",
    },
};

const swaggerDocs = swaggerjsdoc(swaggerOptions);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, swaggerUiOptions)
);

// Redirect to the swagger docs when the user hits the base URL
app.get("/", (req, res) => {
    res.redirect("/api-docs");
});

// Global Error Handling Middleware - Must be the last middleware
app.use(errorMiddleware);

export { app };
