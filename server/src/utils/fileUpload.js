import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath, fileType) => {
  try {
    if (!localFilePath) return null; // If file does not exist, return null

    const uploadedFile = await cloudinary.uploader.upload(localFilePath, {
      folder: `video-sharing-app-backend/${fileType}`,
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
