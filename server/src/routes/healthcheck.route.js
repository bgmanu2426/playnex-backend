import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

const router = Router();

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Check the server health
 *     tags:
 *       - Healthcheck
 *     responses:
 *       200:
 *         description: Server is running
 *       500:
 *         description: Internal Server Error
 */

router.route("/").get(healthcheck);

export default router;
