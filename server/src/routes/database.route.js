import { Router } from "express";
import { emptyDatabase } from "../controllers/database.controller.js";
import createRateLimiterWith from "../middlewares/ratelimit.middleware.js";

const router = Router(); // create a new router object

// Configure rate limiting with IP extraction
const limiter = createRateLimiterWith(24, 0, 2); // 24 hours, 0 minutes, 2 requests
router.use(limiter); // Apply rate limiter middleware to all routes in this file

/**
 * @swagger
 * /database/empty:
 *   delete:
 *     tags:
 *       - ❌ Danger Zone
 *     summary: Empty the entire database.
 *     description: Deletes all documents from all collections in the database. **Use with caution.**
 *     responses:
 *       '200':
 *         description: Database emptied successfully
 *       '401':
 *         description: Unauthorized - Invalid token or insufficient permissions
 *       '500':
 *         description: Internal server error
 */

// Apply authentication middleware
router.route("/empty").delete(emptyDatabase);

export default router;
