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
 * @param {string} folderName - The name of the folder to upload the file to
 * @returns {Promise<Object|null>} - The uploaded file details or null if upload fails
 */
export const uploadOnCloudinary = async (localFilePath, folderName) => {
    try {
        if (!localFilePath) return null; // If file does not exist, return null

        const uploadedFile = await cloudinary.v2.uploader.upload(
            localFilePath,
            {
                folder: `yt-clone-backend/${folderName}`,
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
 * @returns {Promise<Object|null>} - The result of the deletion or null if deletion fails
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null; // If publicId does not exist, return null
        const deletedFile = await cloudinary.v2.uploader.destroy(publicId); // Delete file from cloudinary
        return deletedFile; // Return the deleted file
    } catch (error) {
        console.log("Error while deleting file: ", error);
    }
};

/**
 * Deletes a video file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object|null>} - The result of the deletion or null if deletion fails
 */
export const deleteVideoCloudinary = async (publicId) => {
    try {
        if (!publicId) return null; // If publicId does not exist, return null
        const deletedFile = await cloudinary.v2.uploader.destroy(publicId, { resource_type: "video" }); // Delete file from cloudinary
        return deletedFile; // Return the deleted file
    } catch (error) {
        console.log("Error while deleting file: ", error);
    }
};

/**
 * Recursively deletes all files and folders under "folderPath"
 */
export const deleteAllFilesFromCloudinary = async (folderPath = "yt-clone-backend") => {
    try {
        // Remove all resource types
        for (const rType of ["image", "video", "raw"]) {
            const { resources } = await cloudinary.v2.api.resources({
                type: "upload",
                prefix: `${folderPath}/`,
                resource_type: rType,
            });
            for (const resource of resources) {
                await cloudinary.v2.uploader.destroy(resource.public_id, {
                    resource_type: rType,
                });
            }
        }

        // Recursively delete any subfolders
        const subFolders = await cloudinary.v2.api.sub_folders(folderPath);
        for (const subFolder of subFolders.folders) {
            await deleteAllFilesFromCloudinary(`${folderPath}/${subFolder.name}`);
        }

        // Finally remove the now-empty folder
        await cloudinary.v2.api.delete_folder(folderPath);
    } catch (error) {
        console.log("Error while deleting files:", error);
    }
};