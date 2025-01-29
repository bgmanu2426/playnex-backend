import { Router } from "express";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    getVideosByUserId,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import createRateLimiterWith from "../middlewares/ratelimit.middleware.js";

const router = Router(); // create a new router object

// Configure rate limiting with IP extraction
const limiter = createRateLimiterWith(24, 0, 5); // 24 hours, 0 minutes, 5 requests
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @swagger
 * /videos:
 *   get:
 *     tags:
 *       - 📹 Videos
 *     summary: Get all videos
 *     description: Retrieve a list of all videos.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of videos
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - 📹 Videos
 *     summary: Publish a new video
 *     description: Publish a new video with a video file and thumbnail.
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *              - title
 *              - description
 *              - videoFile
 *              - thumbnail
 *             properties:
 *               title:
 *                 type: string
 *                 description: The video title
 *                 example: My First Video
 *               description:
 *                 type: string
 *                 description: The video description
 *                 example: This is my first video
 *               isPublished:
 *                 type: boolean
 *                 description: The video publish status
 *                 default: true
 *               videoFile:
 *                 type: file
 *                 description: The video file
 *               thumbnail:
 *                 type: file
 *                 description: The video thumbnail
 *     responses:
 *       201:
 *         description: Video published successfully
 *       400:
 *         description: Bad Request - Missing or invalid data
 *       500:
 *         description: Internal server error
 */
router
    .route("/")
    .get(getAllVideos)
    .post(
        limiter,
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
        ]),
        publishAVideo
    );

/**
 * @swagger
 * /videos/{videoId}:
 *   get:
 *     tags:
 *       - 📹 Videos
 *     summary: Get a video by ID
 *     description: Retrieve a video by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The video ID
 *     responses:
 *       200:
 *         description: Video found
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - 📹 Videos
 *     summary: Delete a video by ID
 *     description: Delete a video by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The video ID
 *     responses:
 *       200:
 *         description: Video deleted
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags:
 *       - 📹 Videos
 *     summary: Update a video by ID
 *     description: Update a video's details by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The video ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - thumbnail
 *               - title
 *               - description
 *             properties:
 *               thumbnail:
 *                 type: file
 *                 description: The video thumbnail
 *               title:
 *                 type: string
 *                 description: The video title
 *                 example: My Updated Video
 *               description:
 *                 type: string
 *                 description: The video description
 *                 example: This is my updated video
 *     responses:
 *       200:
 *         description: Video updated
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(limiter, upload.single("thumbnail"), updateVideo);

/**
 * @swagger
 * /videos/toggle-publish/{videoId}:
 *   patch:
 *     tags:
 *       - 📹 Videos
 *     summary: Toggle publish status of a video
 *     description: Toggle the publish status of a video by its ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: The video ID
 *     responses:
 *       200:
 *         description: Publish status toggled
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */
router.route("/toggle-publish/:videoId").patch(togglePublishStatus);

/**
 * @swagger
 * /videos/u/my-videos:
 *   get:
 *     tags:
 *       - 📹 Videos
 *     summary: Get videos by user ID
 *     description: Retrieve all videos uploaded by the authenticated user.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: User videos fetched
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.route("/u/my-videos").get(getVideosByUserId);

export default router;
