import { Router } from "express";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

/**
 * @swagger
 * /subscriptions/c/{channelId}:
 *   post:
 *     tags:
 *       - 📺 Subscriptions
 *     summary: Toggle subscription to a channel
 *     description: Subscribe or unsubscribe to a channel by channel ID.
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *         description: The channel ID
 *     responses:
 *       200:
 *         description: Subscription toggled successfully
 *       400:
 *         description: Bad Request - Invalid channel ID
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */
router.route("/c/:channelId").post(toggleSubscription);

/**
 * @swagger
 * /subscriptions/my-subscriptions:
 *   get:
 *     tags:
 *       - 📺 Subscriptions
 *     summary: Get subscribed channels
 *     description: Get all channels the authenticated user is subscribed to.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscribed channels fetched successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */
router.route("/my-subscriptions").get(getSubscribedChannels);

/**
 * @swagger
 * /subscriptions/my-subscribers:
 *   get:
 *     tags:
 *       - 📺 Subscriptions
 *     summary: Get channel subscribers
 *     description: Get all subscribers of the authenticated user's channel.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Channel subscribers fetched successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */
router.route("/my-subscribers").get(getUserChannelSubscribers);

export default router;
