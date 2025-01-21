import { Router } from "express";
import { emptyDatabase } from "../controllers/database.controller.js";

const router = Router();

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '401':
 *         description: Unauthorized - Invalid token or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

// Apply authentication middleware
router.route("/empty").delete(emptyDatabase);

export default router;