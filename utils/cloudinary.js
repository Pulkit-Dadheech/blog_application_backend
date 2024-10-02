const cloudinary = require("cloudinary").v2;
const fsPromises = require("fs").promises;
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", 
    });

    console.log("File uploaded successfully on Cloudinary:", res.url);
    return res;
  } catch (error) {
    console.error("Upload to Cloudinary failed:", error.message);
    return { success: false, error: error.message };
  } finally {
    // Always remove the local file after upload attempt (success or failure)
    await fsPromises.unlink(localFilePath);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
    
    if (result.result === "ok") {
      console.log("Old file deleted successfully");
      return true;
    } else {
      console.error("Failed to delete old file", result);
      return false;
    }
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};

module.exports = {
  uploadOnCloudinary,
  deleteFromCloudinary
};
