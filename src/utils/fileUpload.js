import cloudinary from "cloudinary";
import fs from "fs";
import DATA from "../config.js";

/**
 * Configures Cloudinary with the provided credentials
 */
cloudinary.v2.config({
    cloud_name: DATA.cloudinary.cloud_name,
    api_key: DATA.cloudinary.api_key,
    api_secret: DATA.cloudinary.api_secret,
});

/**
 * Uploads a file to Cloudinary
 * @param {string} localFilePath - The local path of the file to upload
 * @param {string} fileType - The type/category of the file
 * @returns {Promise<Object|null>} - The uploaded file details or null if upload fails
 */
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

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} fileType - The type/category of the file
 * @returns {Promise<Object|null>} - The result of the deletion or null if deletion fails
 */
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

export const deleteAllFilesFromCloudinary = async (folderPath = "yt-clone-backend") => {
    try {
        // 1. List and delete all resources in current folder
        const { resources } = await cloudinary.api.resources({
            type: "upload",
            prefix: folderPath + "/",
        });
        for (const resource of resources) {
            await cloudinary.uploader.destroy(resource.public_id);
        }

        // 2. Recursively delete subfolders
        const subFolders = await cloudinary.api.sub_folders(folderPath);
        for (const subFolder of subFolders.folders) {
            await deleteAllFilesFromCloudinary(`${folderPath}/${subFolder.name}`);
        }

        // 3. Finally, delete the now-empty folder
        await cloudinary.api.delete_folder(folderPath);
    } catch (error) {
        console.log("Error while deleting files: ", error);
    }
}
