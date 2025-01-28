/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constants";

interface Comment {
    _id?: string;
    [key: string]: any;
}

interface CommentState {
    loading: boolean;
    comments: Comment[];
    totalComments: number | null;
    hasNextPage: boolean;
}

const initialState: CommentState = {
    loading: false,
    comments: [],
    totalComments: null,
    hasNextPage: false,
};

interface CreateACommentArgs {
    videoId: string;
    content: string;
}

interface EditACommentArgs {
    commentId: string;
    content: string;
}

interface GetVideoCommentsArgs {
    videoId: string;
    page?: number;
    limit?: number;
}

export const createAComment = createAsyncThunk(
    "createAComment",
    async ({ videoId, content }: CreateACommentArgs) => {
        try {
            console.log({ videoId, content });
            const response = await axiosInstance.post(`/comment/${videoId}`, {
                content,
            });
            return response.data.data;
        } catch (error: any) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const editAComment = createAsyncThunk(
    "editAComment",
    async ({ commentId, content }: EditACommentArgs): Promise<Comment> => {
        try {
            const response = await axiosInstance.patch(
                `/comment/c/${commentId}`,
                { content }
            );
            toast.success(response.data?.message);
            return response.data.data;
        } catch (error: any) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const deleteAComment = createAsyncThunk(
    "deleteAComment",
    async (commentId: string): Promise<{ commentId: string }> => {
        try {
            const response = await axiosInstance.delete(
                `/comment/c/${commentId}`
            );
            toast.success(response.data.message);
            console.log(response.data.data);
            return response.data.data;
        } catch (error: any) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const getVideoComments = createAsyncThunk(
    "getVideoComments",
    async ({ videoId, page, limit }: GetVideoCommentsArgs) => {
        const url = new URL(`${BASE_URL}/comment/${videoId}`);
        if (page) url.searchParams.set("page", page.toString());
        if (limit) url.searchParams.set("limit", limit.toString());

        try {
            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error: any) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        cleanUpComments: (state) => {
            state.comments = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getVideoComments.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getVideoComments.fulfilled, (state, action) => {
            state.loading = false;
            state.comments = [...state.comments, ...action.payload.docs];
            state.totalComments = action.payload.totalDocs;
            state.hasNextPage = action.payload.hasNextPage;
        });
        builder.addCase(createAComment.fulfilled, (state, action) => {
            state.comments.unshift(action.payload);
            state.totalComments = (state.totalComments ?? 0) + 1;
        });
        builder.addCase(deleteAComment.fulfilled, (state, action) => {
            state.comments = state.comments.filter(
                (comment) => comment._id !== action.payload.commentId
            );
            state.totalComments = (state.totalComments ?? 0) - 1;
        });
    },
});

export const { cleanUpComments } = commentSlice.actions;

export default commentSlice.reducer;
