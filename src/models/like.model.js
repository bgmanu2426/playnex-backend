import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: "Comment",
            },
        ],
        tweets: [
            {
                type: Schema.Types.ObjectId,
                ref: "Tweet",
            },
        ],
    },
    { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
