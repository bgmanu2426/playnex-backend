import { Router } from "express";
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @swagger
 * /tweets:
 *   post:
 *     tags:
 *       - 🐦 Tweets
 *     summary: Create a new tweet
 *     description: Create a new tweet for the authenticated user.
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             content:
 *               type: string
 *               example: This is my first tweet!
 *     responses:
 *       '201':
 *         description: Tweet created
 *       '400':
 *         description: Bad Request - Missing or invalid data
 *       '500':
 *         description: Internal server error
 */
router.route("/").post(createTweet);

/**
 * @swagger
 * /tweets/u/{userId}:
 *   get:
 *     tags:
 *       - 🐦 Tweets
 *     summary: Get tweets by user ID
 *     description: Get all tweets for a specific user by user ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User tweets fetched
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/u/:userId").get(getUserTweets);

/**
 * @swagger
 * /tweets/{tweetId}:
 *   patch:
 *     tags:
 *       - 🐦 Tweets
 *     summary: Update a tweet by ID
 *     description: Update a tweet by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *         description: The tweet ID
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             content:
 *               type: string
 *               example: Updated tweet content
 *     responses:
 *       200:
 *         description: Tweet updated
 *       404:
 *         description: Tweet not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - 🐦 Tweets
 *     summary: Delete a tweet by ID
 *     description: Delete a tweet by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *         description: The tweet ID
 *     responses:
 *       200:
 *         description: Tweet deleted
 *       404:
 *         description: Tweet not found
 *       500:
 *         description: Internal server error
 */
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
