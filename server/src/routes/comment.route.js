import { Router } from "express";
import {
    addComment,
    deleteComment,
    editComment,
    getVideoComments,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @swagger
 * /comments/{videoId}:
 *   get:
 *     tags: 
 *         - 🗨️ Comments
 *     summary: Get comments for a video
 *     description: Get all comments for a video
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
 *         description: List of comments
 *       400:
 *         description: Invalid video ID
 *       500:
 *         description: Internal Server Error
 *   post:
 *     tags:
 *       - 🗨️ Comments
 *     summary: Add a comment to a video
 *     description: Add a comment to a video
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is an example comment
 *     responses:
 *       201:
 *         description: Comment added
 *       400:
 *         description: Invalid video ID
 *       500:
 *         description: Internal Server Error
 */
router.route("/:videoId").get(getVideoComments).post(addComment);

/**
 * @swagger
 * /comments/c/{commentId}:
 *   patch:
 *     tags:
 *       - 🗨️ Comments
 *     summary: Update (edit) a comment
 *     description: Update the text of a comment
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is an example for updated comment
 *     responses:
 *       200:
 *         description: Comment edited
 *       400:
 *         description: Invalid comment ID
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     tags:
 *       - 🗨️ Comments
 *     summary: Delete a comment
 *     description: Delete a comment
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted
 *       400:
 *         description: Invalid comment ID
 *       500:
 *         description: Internal Server Error
 */
router.route("/c/:commentId").patch(editComment).delete(deleteComment);

export default router;
