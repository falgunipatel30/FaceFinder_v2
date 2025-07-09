const cloudinary = require("cloudinary").v2;

const cloudinaryConnect = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });
  } catch (error) {
    console.log(error);
  }
};

const uploadimageToCloudinary = async (file) => {
  const image = await cloudinary.uploader.upload(file, {
    resource_type: "image",
  });

  return image;
};

const uploadVideoToCloudinary = async (file) => {
  try {
    const video = await cloudinary.uploader.upload(file, {
      resource_type: "video",
    });

    console.log("Cloudinary Video Upload Response:", video); // Debugging: Check the response from Cloudinary

    if (!video || !video.secure_url) {
      throw new Error("Failed to retrieve secure URL from Cloudinary");
    }

    return video;
  } catch (error) {
    console.error("Error uploading video to Cloudinary:", error); // Log any errors
    throw error; // Rethrow the error to handle it in the calling function
  }
};

module.exports = {
  uploadimageToCloudinary,
  cloudinaryConnect,
  uploadVideoToCloudinary,
};
