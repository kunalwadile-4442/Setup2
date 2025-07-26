// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
// import dotenv from "dotenv";
// dotenv.config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) {
//       return null;
//     }
//     // upload a file on Cloudinary
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });
//     // file upload successfully
//     try {
//       fs.unlinkSync(localFilePath);
//     } catch (err) {
//       console.warn("Failed to delete local file:", err.message);
//     }
//     return {
//       url: response.secure_url,
//       publicId: response.public_id,
//     };
    
//   } catch (err) {
//     fs.unlinkSync(localFilePath); //remove the local saved temp file as the upload failed
//     console.error("Error uploading file on Cloudinary", err);
//     return null;
//   }
// };

// export { uploadOnCloudinary };

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFilePath, resourceType = "auto") => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
       type: "upload", 
    });

    // Clean up local file
    try {
      fs.unlinkSync(localFilePath);
    } catch (err) {
      console.warn("Failed to delete local file:", err.message);
    }

    return {
      url: response.secure_url,
      publicId: response.public_id,
    };
  } catch (err) {
    // Delete file if upload failed
    try {
      fs.unlinkSync(localFilePath);
    } catch (_) {}
    console.error("Cloudinary upload error:", err.message);
    return null;
  }
};

export { uploadOnCloudinary };
