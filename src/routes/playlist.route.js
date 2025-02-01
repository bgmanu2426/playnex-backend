import { Router } from "express";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @swagger
 * /playlists:
 *   post:
 *     tags:
 *       - 🎞️ Playlists
 *     summary: Create a new playlist
 *     description: Create a new playlist with a title and description.
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             title:
 *               type: string
 *               example: My Playlist
 *             description:
 *               type: string
 *               example: My favorite videos
 *     responses:
 *       '201':
 *         description: Playlist created
 *       '400':
 *         description: Bad Request - Missing or invalid credentials
 *       '500':
 *         description: Internal server error
 */
router.route("/").post(createPlaylist);

/**
 * @swagger
 * /playlists/{playlistId}:
 *   get:
 *     tags:
 *       - 🎞️ Playlists
 *     summary: Get a playlist by ID
 *     description: Get a playlist by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: The playlist ID
 *     responses:
 *       200:
 *         description: Playlist found
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags:
 *       - 🎞️ Playlists
 *     summary: Update a playlist by ID
 *     description: Update a playlist by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: The playlist ID
 *     requestBody:
 *       required: true
 *       content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *             title:
 *               type: string
 *               example: Updated Playlist Title
 *             description:
 *               type: string
 *               example: Updated Playlist Description
 *     responses:
 *       200:
 *         description: Playlist updated
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - 🎞️ Playlists
 *     summary: Delete a playlist by ID
 *     description: Delete a playlist by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: The playlist ID
 *     responses:
 *       200:
 *         description: Playlist deleted
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 */
router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

/**
 * @swagger
 * /playlists/add/{videoId}/{playlistId}:
 *   patch:
 *     tags:
 *       - 🎞️ Playlists
 *     summary: Add a video to a playlist
 *     description: Add a video to a playlist by video ID and playlist ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The video ID
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: The playlist ID
 *     responses:
 *       200:
 *         description: Video added to playlist
 *       404:
 *         description: Playlist or video not found
 *       500:
 *         description: Internal server error
 */
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);

/**
 * @swagger
 * /playlists/remove/{videoId}/{playlistId}:
 *   patch:
 *     tags:
 *       - 🎞️ Playlists
 *     summary: Remove a video from a playlist
 *     description: Remove a video from a playlist by video ID and playlist ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The video ID
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: The playlist ID
 *     responses:
 *       200:
 *         description: Video removed from playlist
 *       404:
 *         description: Playlist or video not found
 *       500:
 *         description: Internal server error
 */
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

/**
 * @swagger
 * /playlists/user/{userId}:
 *   get:
 *     tags:
 *       - 🎞️ Playlists
 *     summary: Get all playlists for a user
 *     description: Get all playlists for a specific user by user ID.
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
 *         description: User playlists fetched
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/user/:userId").get(getUserPlaylists);

export default router;
