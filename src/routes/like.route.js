import { Router } from "express";
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @swagger
 * /likes/toggle/v/{videoId}:
 *   post:
 *     tags:
 *       - 👍 Likes
 *     summary: Toggle like for a video
 *     description: Toggle like for a video. If the video is already liked by the authenticated user, then it will be unliked. If the video is not liked by the authenticated user, then it will be liked.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video
 *     responses:
 *       200:
 *         description: Toggled like status for the video
 *       400:
 *         description: Invalid video ID
 *       500:
 *         description: Internal Server Error
 */

router.route("/toggle/v/:videoId").post(toggleVideoLike);

/**
 * @swagger
 * /likes/toggle/c/{commentId}:
 *   post:
 *     tags:
 *       - 👍 Likes
 *     summary: Toggle like for a comment
 *     description: Toggle like for a comment. If the comment is already liked by the authenticated user, then it will be unliked. If the comment is not liked by the authenticated user, then it will be liked.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     responses:
 *       200:
 *         description: Toggled like status for the comment
 *       400:
 *         description: Invalid comment ID
 *       500:
 *         description: Internal Server Error
 */
router.route("/toggle/c/:commentId").post(toggleCommentLike);

/**
 * @swagger
 * /likes/toggle/t/{tweetId}:
 *   post:
 *     tags:
 *       - 👍 Likes
 *     summary: Toggle like for a tweet
 *     description: Toggle like for a tweet. If the tweet is already liked by the authenticated user, then it will be unliked. If the tweet is not liked by the authenticated user, then it will be liked.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tweetId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tweet
 *     responses:
 *       200:
 *         description: Toggled like status for the tweet
 *       400:
 *         description: Invalid tweet ID
 *       500:
 *         description: Internal Server Error
 */
router.route("/toggle/t/:tweetId").post(toggleTweetLike);

/**
 * @swagger
 * /likes/videos:
 *   get:
 *     tags:
 *       - 👍 Likes
 *     summary: Get all liked videos for the authenticated user
 *     description: Get all liked videos for the authenticated user
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of liked videos
 *       500:
 *         description: Internal Server Error
 */
router.route("/videos").get(getLikedVideos);

export default router;
