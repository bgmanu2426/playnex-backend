import express from "express"; // import express from express
import cors from "cors"; // import cors from cors
import cookieParser from "cookie-parser"; // import cookieParser from cookie-parser

const app = express(); // create an express app

// use cross-origin-resource-sharing middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

// Routes
import userRoutes from "./routes/user.routes.js";

// Routes declaration
app.use("/api/v1/users", userRoutes); // use user routes

export { app }; // export the app object
