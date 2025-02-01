import connectToDB from "./db/index.js"; // Import connectToDB from db/index.js
import { app } from "./app.js"; // Import app from app.js
import DATA from "./config.js";

// Connect to MongoDB and start the express server
connectToDB()
    .then(() => {
        app.listen(DATA.port || 8000, () => {
            console.log(`🌐 Server listening on ${DATA.server_url}`);
            console.log(`📄 API docs are avilable on ${DATA.server_url}/api-docs`);
        }); // Start the express server
    })
    .catch((err) => {
        console.log("MongoDB Connection failed: ", err);
    });
