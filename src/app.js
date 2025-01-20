import express from "express"; // import express from express
import cors from "cors"; // import cors from cors
import cookieParser from "cookie-parser"; // import cookieParser from cookie-parser
import swaggerjsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import DATA from "./config.js";

const app = express(); // create an express app

// use cross-origin-resource-sharing middleware
app.use(
    cors({
        origin: DATA.client_url,
        credentials: true,
    })
);

// use express.json() middleware to parse json data
app.use(
    express.json({
        limit: "12kb",
    })
);

// use express.urlencoded() middleware to parse urlencoded data
app.use(
    express.urlencoded({
        extended: true,
        limit: "12kb",
    })
);
app.use(express.static("public")); // use express.static() middleware to serve static files
app.use(cookieParser()); // use cookieParser() middleware to parse cookies

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Youtube Clone API',
            description: 'Youtube Clone API Information for developers',
            contact: {
                name: 'Lakshminarayana'
            },
        },
        servers: [
            {
                url: "http://localhost:8000/api/v1"
            }
        ],
    },
    apis: ['./src/routes/*.js']
}

const swaggerDocs = swaggerjsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))


// Routes
import userRoutes from "./routes/user.route.js";
import videoRoutes from "./routes/video.route.js";
import commentRoutes from "./routes/comment.route.js";
import dashboardRoutes from "./routes/dashboard.route.js";
import playlistRoutes from "./routes/playlist.route.js";
import healthCheckRoutes from "./routes/healthcheck.route.js";
import subscriptionRoutes from "./routes/subscription.route.js";
import tweetRoutes from "./routes/tweet.route.js";

// Routes declaration
app.use("/api/v1/users", userRoutes); // use user routes
app.use("/api/v1/videos", videoRoutes); // use video routes
app.use("/api/v1/comments", commentRoutes); // use comment routes
app.use("/api/v1/dashboard", dashboardRoutes); // use dashboard routes
app.use("/api/v1/playlist", playlistRoutes); // use playlist routes
app.use("/api/v1/health", healthCheckRoutes); // use healthcheck routes
app.use("/api/v1/subscriptions", subscriptionRoutes); // use subscription routes
app.use("/api/v1/tweets", tweetRoutes); // use tweet routes

// Global Error Handling Middleware
import errorMiddleware from "./middlewares/error.middleware.js";
app.use(errorMiddleware);

export { app }; // export the app object
