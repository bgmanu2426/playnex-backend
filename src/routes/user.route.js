import { Router } from "express";
import {
    changeCurrentPassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    getCurrentUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateAccountDetails,
    getUserChannelProfile,
    getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import createRateLimiterWith from "../middlewares/ratelimit.middleware.js";

const router = Router(); // create a new router object

// Configure rate limiting with IP extraction
const limiter = createRateLimiterWith(24, 0, 10); // 24 hours, 0 minutes, 10 requests

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - 🔐 Authentication
 *     summary: Register a new user.
 *     description: Creates a new user account with avatar and cover image uploads.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - username
 *               - email
 *               - password
 *               - avatar
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Pass@1234
 *               avatar:
 *                 type: file
 *                 description: User's avatar image
 *               coverImage:
 *                 type: file
 *                 description: User's cover image
 *           example:
 *             fullName: John Doe
 *             username: johndoe
 *             email: johndoe@example.com
 *             password: Pass@1234
 *             avatar: <binary data>
 *             coverImage: <binary data>
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad Request - Missing or invalid credentials
 *       '500':
 *         description: Internal server error
 */

router.route("/register").post(
    limiter,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - 🔐 Authentication
 *     summary: Login a user.
 *     description: Authenticates a user and returns access and refresh tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Pass@1234
 *           example:
 *             email: johndoe@example.com
 *             password: Pass@1234
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Pass@1234
 *           example:
 *             email: johndoe@example.com
 *             password: Pass@1234
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *       '400':
 *         description: Bad Request - Missing or invalid credentials
 *       '404':
 *         description: User not found
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *       '500':
 *         description: Internal server error
 */

router.route("/login").post(upload.none(), loginUser);

// secured routes

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags:
 *       - 🔐 Authentication
 *     summary: Logout a user.
 *     description: Logs out the authenticated user by clearing cookies and tokens.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *       '400':
 *         description: Bad Request - Missing or invalid credentials
 *       '404':
 *         description: User not found
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *       '500':
 *         description: Internal server error
 */

router.route("/logout").post(verifyJWT, logoutUser);

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     tags:
 *       - 🔐 Authentication
 *     summary: Refresh access token.
 *     security:
 *      - bearerAuth: []
 *     description: Generates a new access token using a valid refresh token.
 *     responses:
 *       '200':
 *         description: Token refreshed successfully
 *       '400':
 *         description: Bad Request - Missing or invalid credentials
 *       '404':
 *         description: User not found
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *       '500':
 *         description: Internal server error
 */

router.route("/refresh-token").post(refreshAccessToken);

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     tags:
 *       - 👤 User Managment
 *     summary: Change current user's password.
 *     description: Allows the authenticated user to change their password.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Pass@1234
 *               newPassword:
 *                 type: string
 *                 example: Test@1234
 *           example:
 *             currentPassword: Pass@1234
 *             newPassword: Test@1234
 *     responses:
 *       '200':
 *         description: Password changed successfully
 *       '400':
 *         description: Bad Request - Missing or invalid credentials
 *       '404':
 *         description: User not found
 *       '401':
 *         description: Unauthorized - Invalid credentials
 *       '500':
 *         description: Internal server error
 */

router
    .route("/change-password")
    .patch(limiter, verifyJWT, changeCurrentPassword);

/**
 * @swagger
 * /users/current-user:
 *   get:
 *     tags:
 *       - 👤 User Managment
 *     summary: Get current authenticated user.
 *     description: Retrieves information about the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user information retrieved successfully
 *       '401':
 *         description: Unauthorized - Invalid or missing token
 *       '500':
 *         description: Internal server error
 */

router.route("/current-user").get(verifyJWT, getCurrentUser);

/**
 * @swagger
 * /users/update-user:
 *   patch:
 *     tags:
 *       - 👤 User Managment
 *     summary: Update user account details.
 *     description: Allows the authenticated user to update their account information.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Smith
 *               email:
 *                 type: string
 *                 example: john.smith@example.com
 *           example:
 *             fullName: John Smith
 *             email: john.smith@example.com
 *     responses:
 *       '200':
 *         description: User account details updated successfully
 *       '400':
 *         description: Bad Request - Missing or invalid fields
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '500':
 *         description: Internal server error
 */

router.route("/update-user").patch(limiter, verifyJWT, updateAccountDetails);

/**
 * @swagger
 * /users/update-avatar:
 *   patch:
 *     tags:
 *       - 👤 User Managment
 *     summary: Update user avatar.
 *     description: Allows the authenticated user to update their avatar image.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: file
 *                 description: New avatar image
 *     responses:
 *       '200':
 *         description: User avatar updated successfully
 *       '400':
 *         description: Bad Request - Missing or invalid avatar
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '500':
 *         description: Internal server error
 */

router
    .route("/update-avatar")
    .patch(limiter, verifyJWT, upload.single("avatar"), updateUserAvatar);

/**
 * @swagger
 * /users/update-cover-image:
 *   patch:
 *     tags:
 *       - 👤 User Managment
 *     summary: Update user cover image.
 *     description: Allows the authenticated user to update their cover image.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - coverImage
 *             properties:
 *               coverImage:
 *                 type: file
 *                 description: New cover image
 *     responses:
 *       '200':
 *         description: User cover image updated successfully
 *       '400':
 *         description: Bad Request - Missing or invalid cover image
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '500':
 *         description: Internal server error
 */

router
    .route("/update-cover-image")
    .patch(
        limiter,
        verifyJWT,
        upload.single("coverImage"),
        updateUserCoverImage
    );

/**
 * @swagger
 * /users/c/{username}:
 *   get:
 *     tags:
 *       - 👤 User Managment
 *     summary: Get user channel profile.
 *     description: Retrieves the channel profile of a user based on their username.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username of the channel to retrieve.
 *         example: johndoe
 *     responses:
 *       '200':
 *         description: Channel profile retrieved successfully
 *       '400':
 *         description: Bad Request - Invalid username
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '404':
 *         description: Channel not found
 *       '500':
 *         description: Internal server error
 */

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

/**
 * @swagger
 * /users/watchHistory:
 *   get:
 *     tags:
 *       - 👤 User Managment
 *     summary: Get user's watch history.
 *     description: Retrieves the authenticated user's watch history.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User watch history retrieved successfully
 *       '401':
 *         description: Unauthorized - Invalid token
 *       '500':
 *         description: Internal server error
 */

router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;
