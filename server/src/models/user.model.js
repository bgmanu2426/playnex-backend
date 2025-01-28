import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import DATA from "../config.js";

/**
 * @typedef {Object} User
 * @property {string} username - Unique username
 * @property {string} email - User's email address
 * @property {string} fullName - User's full name
 * @property {string} avatar - URL to the user's avatar image
 * @property {string} coverImage - URL to the user's cover image
 * @property {mongoose.Types.ObjectId[]} watchHistory - Array of watched video IDs
 * @property {string} password - Hashed password
 * @property {string} refreshToken - Refresh token for authentication
 */

/**
 * User Schema
 */
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email already exists"],
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: [true, "Users fullname is required"],
            trim: true,
            index: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        avatarPublicId: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        coverImagePublicId: {
            type: String,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

/**
 * Hash password before saving to database
 * @param {Function} next - The next middleware function
 */
userSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

/**
 * Compare password with the one in the database
 * @param {string} password - The password to compare
 * @returns {boolean} - True if the password matches, false otherwise
 */
userSchema.methods.isPasswordCorrect = function (password) {
    return bcrypt.compareSync(password, this.password);
};

/**
 * Generate access token
 * @returns {string} - The generated access token
 */
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName,
        },
        DATA.tokens.accessTokenSecret,
        {
            expiresIn: DATA.tokens.accessTokenExpiration,
        }
    );
};

/**
 * Generate refresh token
 * @returns {string} - The generated refresh token
 */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, DATA.tokens.refreshTokenSecret, {
        expiresIn: DATA.tokens.refreshTokenExpiration,
    });
};

export const User = mongoose.model("User", userSchema);
