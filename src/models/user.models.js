import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import DATA from "../config.js";

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
    coverImage: {
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

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
}); // Hash password before saving to database

userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compareSync(password, this.password);
}; // Compare password with the one in the database

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
    },
    {
      algorithm: "SHA256",
    }
  );
}; // Generate access token

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, DATA.tokens.accessTokenSecret, {
    expiresIn: DATA.tokens.refreshTokenExpiration,
  });
}; // Generate refresh token

export const User = mongoose.model("User", userSchema);
