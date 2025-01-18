import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config(); // Load environment variables from .env file

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, fileType) => {
  try {
    if (!localFilePath) return null; // If file does not exist, return null

    const uploadedFile = await cloudinary.v2.uploader.upload(localFilePath, {
      folder: `yt-clone-backend/${fileType}`,
      resource_type: "auto",
    }); // Upload file on cloudinary
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
    const deletedFile = await cloudinary.v2.uploader.destroy(`yt-clone-backend/${fileType}/${publicId}`); // Delete file from cloudinary
    return deletedFile; // Return the deleted file
  } catch (error) {
    console.log("Error while deleting file: ", error);
  }
}