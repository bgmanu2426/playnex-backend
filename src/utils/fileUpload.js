import cloudinary from "cloudinary";
import fs from "fs";
import DATA from "../config.js";

cloudinary.v2.config({
    cloud_name: DATA.cloudinary.cloud_name,
    api_key: DATA.cloudinary.api_key,
    api_secret: DATA.cloudinary.api_secret,
});

export const uploadOnCloudinary = async (localFilePath, fileType) => {
    try {
        if (!localFilePath) return null; // If file does not exist, return null

        const uploadedFile = await cloudinary.v2.uploader.upload(
            localFilePath,
            {
                folder: `yt-clone-backend/${fileType}`,
                resource_type: "auto",
            }
        ); // Upload file on cloudinary
        // console.log(uploadedFile);

        fs.unlinkSync(localFilePath); // Delete file from local storage as it is uploaded on cloudinary

        return uploadedFile; // Return the uploaded file
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete file from local storage as it is not uploaded on cloudinary
        // console.log("Error while uploading file: ", error);
    }
};

export const deleteFromCloudinary = async (publicId, fileType) => {
    try {
        if (!publicId) return null; // If publicId does not exist, return null
        const deletedFile = await cloudinary.v2.uploader.destroy(
            `yt-clone-backend/${fileType}/${publicId}`
        ); // Delete file from cloudinary
        return deletedFile; // Return the deleted file
    } catch (error) {
        console.log("Error while deleting file: ", error);
    }
};
