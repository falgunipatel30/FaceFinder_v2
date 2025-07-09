const Album = require("../model/Album");
const User = require("../model/User");
const Folder = require("../model/Folder");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const exifr = require("exifr");

const sharp = require("sharp");

const addAlbum = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const albumCreate = await Album.create({
      name: name,
    });
    const user = await User.findOneAndUpdate(
      { userId: req.user.userId },
      { $push: { albums: albumCreate._id } },
      { new: true }
    ).populate({
      path: "albums",
      options: { sort: { name: 1 } }, // Sort by album name ascending
    });

    res.status(201).json({
      success: true,
      message: "Album created successfully",
      album: albumCreate,
      user: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const addImages = async (req, res) => {
  try {
    const { albumId, folderId } = req.body;
    console.log("albumId : ", albumId, "folderId : ", folderId);
    if (!albumId && !folderId) {
      return res
        .status(400)
        .json({ message: "Either albumId or folderId is required" });
    }
    if (!req.files || !req.files.imageFile) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    let imageFiles = Array.isArray(req.files.imageFile)
      ? req.files.imageFile
      : [req.files.imageFile];
    const fileTypes = ["image/jpeg", "image/png", "image/jpg"];

    // Get user details
    const currUser = await User.findOne({ userId: req.user.userId });
    if (!currUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let parent;
    let parentPath;
    let baseUrl;

    if (folderId && folderId !== undefined) {
      parent = folderId
        ? await Folder.findById(folderId).populate("album folders")
        : null;
      if (!parent || !parent.album)
        return res.status(404).json({ message: "Folder or album not found" });

      const fPath = await getFullFolderPath(folderId);
      parentPath = path.join(
        __dirname,
        "uploads",
        currUser.username,
        parent.album.name,
        fPath
      );
      baseUrl = `http://localhost:4000/uploads/${currUser.username}/${
        parent.album.name
      }/${await getFullFolderPath(folderId)}`;
    } else if (albumId && albumId !== "undefined") {
      parent = albumId ? await Album.findById(albumId) : null;
      if (!parent) return res.status(404).json({ message: "Album not found" });

      parentPath = path.join(
        __dirname,
        "uploads",
        currUser.username,
        parent.name
      );
      baseUrl = `http://localhost:4000/uploads/${currUser.username}/${parent.name}`;
    } else {
      return res
        .status(400)
        .json({ message: "Either albumId or folderId is required" });
    }

    const originalsPath = path.join(parentPath, "originals");
    const thumbnailsPath = path.join(parentPath, "thumbnails");

    // Ensure upload directory exists
    [parentPath, originalsPath, thumbnailsPath].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    let uploadedImages = [];

    for (const file of imageFiles) {
      // Validate file type
      if (!fileTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only JPG, JPEG, and PNG are allowed.",
        });
      }
      let clickedAt = null;
      try {
        const exifData = await exifr.parse(file.data);
        if (exifData?.DateTimeOriginal) {
          clickedAt = exifData.DateTimeOriginal;
        }
      } catch (err) {
        console.warn("❌ Error parsing EXIF:", err.message);
      }
      const timeStamp = Date.now();
      const sanitizedFileName = file.name.replace(/\s+/g, "_");
      const fileBaseName = `${timeStamp}-${sanitizedFileName}`;

      // Save Original Image
      const originalFilePath = path.join(originalsPath, fileBaseName);
      await file.mv(originalFilePath);

      // Generate and Save Thumbnail
      const thumbnailFileName = fileBaseName.replace(/\.\w+$/, ".webp"); // Ensure extension is .webp
      const thumbnailFilePath = path.join(thumbnailsPath, thumbnailFileName);

      await sharp(file.data)
        .resize({ width: 200, height: 200, fit: "cover" })
        .webp({ quality: 75 })
        .toFile(thumbnailFilePath);

      // Construct image URLs
      const originalImageUrl = `${baseUrl}/originals/${fileBaseName}`;
      const thumbnailImageUrl = `${baseUrl}/thumbnails/${thumbnailFileName}`;

      uploadedImages.push({
        url: originalImageUrl,
        thumbnail: thumbnailImageUrl,
        name: file.name,
        addedAt: Date.now(),
        clickedAt: clickedAt,
      });

      if (parent.thumbnail === null) {
        parent.thumbnail = thumbnailImageUrl;
      }
    }

    // Send request to FastAPI for AI processing
    const fastAPIUrl = "http://localhost:8000/process-album/";
    try {
      const response = await axios.post(fastAPIUrl, {
        album_name: parent.album ? parent.album.name : parent.name,
        // folder_name: folderId ? parent.name : null,
        user_name: currUser.username,
      });
    } catch (error) {
      console.error("❌ Error sending request to FastAPI:", error);
    }

    let updatedParent;

    if (folderId) {
      updatedParent = await Folder.findByIdAndUpdate(
        folderId,
        { $push: { images: { $each: uploadedImages } } },
        { new: true }
      );
    } else {
      updatedParent = await Album.findByIdAndUpdate(
        albumId,
        { $push: { images: { $each: uploadedImages } } },
        { new: true }
      );
    }

    if (!updatedParent) {
      return res.status(404).json({ message: "Couldn't add images" });
    }
    res.status(200).json({
      success: true,
      message: "Images added successfully",
      parent: updatedParent,
    });
  } catch (error) {
    console.error("❌ Error uploading images:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const getAlbums = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId })
      .populate({
        path: "albums",
        options: { sort: { name: 1 } }, // Sort by album name ascending
      })
      .populate("pinnedAlbums");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      success: true,
      message: "Albums retrieved successfully",
      albums: user.albums,
      pinnedAlbums: user.pinnedAlbums,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;

    if (!albumId) {
      return res.status(400).json({ message: "Album ID is required" });
    }

    const currAlbum = await Album.findById(albumId).populate("folders");
    const currUser = await User.findOne({ userId: req.user.userId });

    if (!currAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    const albumPath = path.join(
      __dirname,
      "uploads",
      currUser.username,
      currAlbum.name
    );

    // **1. Delete All Images in Album**
    for (const image of currAlbum.images) {
      const filePath1 = path.join(
        albumPath,
        "originals",
        path.basename(image.url)
      );
      const filePath2 = path.join(
        albumPath,
        "thumbnails",
        path.basename(image.thumbnail)
      );

      if (fs.existsSync(filePath1)) {
        await fs.promises.unlink(filePath1);
        await fs.promises.unlink(filePath2);
      }
    }

    // **2. Recursively Delete All Folders Inside the Album**
    const deleteFoldersRecursively = async (folderId) => {
      const folder = await Folder.findById(folderId).populate("folders");

      if (folder) {
        // Delete images inside the folder
        for (const image of folder.images) {
          const filePath1 = path.join(
            albumPath,
            folder.name,
            "originals",
            path.basename(image.url)
          );
          const filePath2 = path.join(
            albumPath,
            folder.name,
            "thumbnails",
            path.basename(image.thumbnail)
          );
          if (fs.existsSync(filePath1)) {
            await fs.promises.unlink(filePath1);
            await fs.promises.unlink(filePath2);
          }
        }

        // Recursively delete subfolders
        for (const subFolder of folder.folders) {
          await deleteFoldersRecursively(subFolder._id);
        }

        // Remove folder from database
        await Folder.findByIdAndDelete(folder._id);
      }
    };

    for (const folder of currAlbum.folders) {
      await deleteFoldersRecursively(folder._id);
    }

    // **3. Remove Album Directory**
    if (fs.existsSync(albumPath)) {
      fs.rmSync(albumPath, { recursive: true, force: true });
    }

    // **4. Delete Album from Database**
    await Album.findByIdAndDelete(albumId);

    // **5. Remove Album from User's Album List**
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $pull: {
          albums: albumId,
          pinnedAlbums: albumId, // Ensure album is also removed from pinnedAlbums
        },
      },
      { new: true }
    ).populate([
      {
        path: "albums",
        options: { sort: { name: 1 } },
      },
      {
        path: "pinnedAlbums",
        options: { sort: { name: 1 } },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Album and all associated data deleted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }

    const folder = await Folder.findById(folderId)
      .populate("folders")
      .populate("album")
      .populate("parentFolder");

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const currUser = await User.findOne({ userId: req.user.userId });

    if (!currUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const baseUploadPath = path.join(
      __dirname,
      "uploads",
      currUser.username,
      folder.album.name
    );

    const getFullFolderPath = async (folder) => {
      let folderPath = folder.name;
      let current = folder;

      while (current.parentFolder) {
        current = await Folder.findById(current.parentFolder).populate(
          "parentFolder"
        );
        if (!current) break;
        folderPath = path.join(current.name, folderPath);
      }

      return folderPath;
    };

    const fullFolderPath = await getFullFolderPath(folder);
    const folderDiskPath = path.join(baseUploadPath, fullFolderPath);

    // Recursively delete folders and files
    const deleteFoldersRecursively = async (folderToDelete) => {
      for (const image of folderToDelete.images) {
        const imagePath1 = path.join(
          baseUploadPath,
          await getFullFolderPath(folderToDelete),
          "originals",
          path.basename(image.url)
        );
        const imagePath2 = path.join(
          baseUploadPath,
          await getFullFolderPath(folderToDelete),
          "thumbnails",
          path.basename(image.thumbnail)
        );

        if (fs.existsSync(imagePath1) && fs.existsSync(imagePath2)) {
          await fs.promises.unlink(imagePath1);
          await fs.promises.unlink(imagePath2);
        }
      }

      for (const subFolder of folderToDelete.folders) {
        const fullSub = await Folder.findById(subFolder._id).populate(
          "folders"
        );
        if (fullSub) {
          await deleteFoldersRecursively(fullSub);
        }
      }

      await Folder.findByIdAndDelete(folderToDelete._id);
    };

    await deleteFoldersRecursively(folder);

    if (fs.existsSync(folderDiskPath)) {
      fs.rmSync(folderDiskPath, { recursive: true, force: true });
    }

    // Remove folder reference from parent (Album or Folder)
    let parent;
    if (folder.parentFolder) {
      parent = await Folder.findByIdAndUpdate(folder.parentFolder._id, {
        $pull: { folders: folder._id },
      });
    } else {
      parent = await Album.findByIdAndUpdate(folder.album._id, {
        $pull: { folders: folder._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Folder and all nested content deleted successfully",
      parent: parent,
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const mergeAndDeleteFolder = async (req, res) => {
  try {
    const { folderId } = req.body;
    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }

    const folder = await Folder.findById(folderId)
      .populate("folders")
      .populate("album")
      .populate("parentFolder");

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const currUser = await User.findOne({ userId: req.user.userId });
    if (!currUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const album = folder.album;
    const baseUploadPath = path.join(
      __dirname,
      "uploads",
      currUser.username,
      album.name
    );

    // Calculate destination: either parentFolder path or base album path
    const getFullFolderPath = async (folderObj) => {
      let folderPath = folderObj.name;
      let current = folderObj;
      while (current.parentFolder) {
        current = await Folder.findById(current.parentFolder).populate(
          "parentFolder"
        );
        if (!current) break;
        folderPath = path.join(current.name, folderPath);
      }
      return folderPath;
    };

    const sourceFolderPath = await getFullFolderPath(folder);

    const destinationFolderPath = folder.parentFolder
      ? await getFullFolderPath(folder.parentFolder)
      : "";

    const finalDiskDest1 = path.join(
      baseUploadPath,
      destinationFolderPath,
      "originals"
    );
    const finalDiskDest2 = path.join(
      baseUploadPath,
      destinationFolderPath,
      "thumbnails"
    );

    if (!fs.existsSync(finalDiskDest1)) {
      fs.mkdirSync(finalDiskDest1, { recursive: true });
    }
    if (!fs.existsSync(finalDiskDest2)) {
      fs.mkdirSync(finalDiskDest2, { recursive: true });
    }

    const moveImages = async (folderObj) => {
      for (const image of folderObj.images) {
        const fileName1 = path.basename(image.url);
        const fileName2 = path.basename(image.thumbnail);

        const srcPath1 = path.join(
          baseUploadPath,
          await getFullFolderPath(folderObj),
          "originals",
          fileName1
        );

        const srcPath2 = path.join(
          baseUploadPath,
          await getFullFolderPath(folderObj),
          "thumbnails",
          fileName2
        );
        const destPath1 = path.join(finalDiskDest1, fileName1);
        const destPath2 = path.join(finalDiskDest2, fileName2);

        if (fs.existsSync(srcPath1) && fs.existsSync(srcPath2)) {
          await fs.promises.rename(srcPath1, destPath1);
          await fs.promises.rename(srcPath2, destPath2);
        }

        const updatedUrl1 = `http://localhost:4000/uploads/${currUser.username}/${album.name}/${destinationFolderPath}/originals/${fileName1}`;
        const updatedUrl2 = `http://localhost:4000/uploads/${currUser.username}/${album.name}/${destinationFolderPath}/thumbnails/${fileName2}`;

        if (folder.parentFolder) {
          await Folder.findByIdAndUpdate(folder.parentFolder._id, {
            $push: {
              images: {
                url: updatedUrl1,
                name: fileName1,
                addedAt: Date.now(),
                thumbnail: updatedUrl2,
              },
            },
          });
        } else {
          await Album.findByIdAndUpdate(album._id, {
            $push: {
              images: {
                url: updatedUrl1,
                name: fileName2,
                addedAt: Date.now(),
                thumbnail: updatedUrl2,
              },
            },
          });
        }
      }
    };

    // Recursively move images from all subfolders
    const moveAndDeleteFolders = async (folderObj) => {
      await moveImages(folderObj);

      for (const subFolder of folderObj.folders) {
        const fullSub = await Folder.findById(subFolder._id).populate(
          "folders"
        );
        if (fullSub) await moveAndDeleteFolders(fullSub);
      }

      await Folder.findByIdAndDelete(folderObj._id);
    };

    await moveAndDeleteFolders(folder);

    // Delete the actual folder directory
    const fullDiskPath = path.join(baseUploadPath, sourceFolderPath);
    if (fs.existsSync(fullDiskPath)) {
      fs.rmSync(fullDiskPath, { recursive: true, force: true });
    }

    // Remove reference from parent
    let parent;
    if (folder.parentFolder) {
      parent = await Folder.findByIdAndUpdate(folder.parentFolder._id, {
        $pull: { folders: folder._id },
      });
    } else {
      parent = await Album.findByIdAndUpdate(album._id, {
        $pull: { folders: folder._id },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Images moved and folder deleted successfully",
      parent: parent,
    });
  } catch (error) {
    console.error("Error merging and deleting folder:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getFullFolderPathForDelete = async (folderId) => {
  let folderPath = "";
  let currentFolder = await Folder.findById(folderId).populate("parentFolder");

  while (currentFolder) {
    folderPath = path.join(currentFolder.name, folderPath);
    if (!currentFolder.parentFolder) break; // Stop when there's no more parent
    currentFolder = await Folder.findById(currentFolder.parentFolder).populate(
      "parentFolder"
    );
  }

  return folderPath;
};

const deleteImage = async (req, res) => {
  try {
    const { ImageArray, albumId, folderId } = req.body;

    if (!ImageArray || !Array.isArray(ImageArray) || ImageArray.length === 0) {
      return res
        .status(400)
        .json({ message: "ImageArray must contain at least one image URL" });
    }

    // Fetch user
    const currUser = await User.findOne({ userId: req.user.userId });
    if (!currUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let parentItem;
    let parentType;
    let basePath;

    if (folderId) {
      parentItem = await Folder.findById(folderId).populate("album");
      parentType = "folder";
      if (!parentItem) {
        return res.status(404).json({ message: "Folder not found" });
      }
      const album = parentItem.album;
      const folderPath = await getFullFolderPathForDelete(folderId);
      basePath = path.join(
        __dirname,
        "uploads",
        currUser.username,
        album.name,
        folderPath
      );
    } else if (albumId) {
      parentItem = await Album.findById(albumId);
      parentType = "album";
      basePath = path.join(
        __dirname,
        "uploads",
        currUser.username,
        parentItem.name
      );
    } else {
      return res
        .status(400)
        .json({ message: "Either albumId or folderId is required" });
    }

    if (!parentItem) {
      return res.status(404).json({ message: `${parentType} not found` });
    }

    let deletedImages = [];

    for (let i = 0; i < ImageArray.length; i++) {
      const imageUrl = ImageArray[i].url;
      const thumbnail = ImageArray[i].thumbnail;

      if (!imageUrl || !thumbnail) continue;

      // Extract the filename from the image URL
      const fileName1 = path.basename(imageUrl);
      const fileName2 = path.basename(thumbnail);

      const filePath1 = path.join(basePath, "originals", fileName1);
      const filePath2 = path.join(basePath, "thumbnails", fileName2);

      // Check if file exists before deleting
      if (fs.existsSync(filePath1) && fs.existsSync(filePath2)) {
        fs.unlinkSync(filePath1);
        fs.unlinkSync(filePath2);
        deletedImages.push(imageUrl);

        // Remove image from database
        await parentItem.updateOne(
          {
            $pull: { images: { url: imageUrl } },
          },
          { new: true }
        );
      } else {
        console.warn(`File not found: ${filePath1}`);
      }
    }

    // Fetch the updated album or folder
    const updatedParentItem =
      parentType === "album"
        ? await Album.findById(albumId).populate("folders")
        : await Folder.findById(folderId).populate("album folders");

    return res.json({
      message: "Images deleted successfully",
      deletedImages: deletedImages,
      parentType: updatedParentItem,
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const pinAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;

    if (!albumId) {
      return res.status(400).json({ message: "Album ID is required" });
    }

    // const currUser = await User.findOne({ userId: req.user.userId });

    await User.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $pull: { albums: albumId },
      },
      { new: true }
    );

    // 2. Then push to albums
    // await User.findOneAndUpdate(
    //   { userId: req.user.userId },
    //   {
    //     $push: {
    //       albums:
    //         currUser.pinnedAlbums.length > 0 ? currUser.pinnedAlbums[0] : null,
    //     },
    //   },
    //   { new: true }
    // );

    // 3. Pull from pinnedAlbums and push new albumId
    // await User.findOneAndUpdate(
    //   { userId: req.user.userId },
    //   {
    //     $pull: {
    //       pinnedAlbums:
    //         currUser.pinnedAlbums.length > 0 ? currUser.pinnedAlbums[0] : null,
    //     },
    //   },
    //   { new: true }
    // );

    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $push: { pinnedAlbums: albumId },
      },
      { new: true }
    )
      .populate("pinnedAlbums")
      .populate({
        path: "albums",
        options: { sort: { name: 1 } }, // Sort by album name ascending
      });

    res.status(200).json({
      success: true,
      message: "Album pinned successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const unpinAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;

    if (!albumId) {
      return res.status(400).json({ message: "Album ID is required" });
    }

    await User.findOneAndUpdate(
      { userId: req.user.userId },
      { $pull: { pinnedAlbums: albumId } },
      { new: true }
    );

    const user = await User.findOneAndUpdate(
      { userId: req.user.userId },
      { $push: { albums: albumId } },
      { new: true }
    )
      .populate("pinnedAlbums")
      .populate({
        path: "albums",
        options: { sort: { name: 1 } }, // Sort by album name ascending
      });

    res.status(200).json({
      success: true,
      message: "Album unpinned successfully",
      pinnedAlbums: user.pinnedAlbums,
      albums: user.albums,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchImage = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageName = req.files.file.name;
    const file = req.files.file;

    // directory where incoming image will be stored
    const uploadDir = path.join(__dirname, "../temp");

    // Ensure the /temp directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // image file name insie /temp directory
    const fileName = `${Date.now()}-${file.name}`;

    // image path for saving the image
    const filePath = path.join(uploadDir, fileName);
    try {
      await file.mv(filePath);

      const fastAPIUrl = "http://localhost:8000/search-image/";
      const response = await axios.post(fastAPIUrl, { image_name: fileName });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Delete the file after it's been processed
      }
      return res.json({
        success: true,
        message: "AI Search Results Sent",
        searchResults: response.data.results,
      });
    } catch (error) {
      console.error("❌ Error sending image to AI:", error.message);
      console.log(error);
      // Prevent duplicate response by checking if headers are sent
      if (!res.headersSent) {
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  } catch (error) {
    console.error(" Error in searchImage:", error.message);
  }
};

function getDimensionsFromRatio(ratio) {
  switch (ratio) {
    case "1:1":
      return { width: 800, height: 800 };
    case "4:3":
      return { width: 800, height: 600 };
    case "16:9":
      return { width: 1280, height: 720 };
    default:
      throw new Error("Unsupported ratio");
  }
}

const editRatio = async (req, res) => {
  try {
    const { ratio, albumId, folderId, images } = req.body;

    if (!ratio || !images || (!albumId && !folderId)) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const currUser = await User.findOne({ userId: req.user.userId });
    if (!currUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { width, height } = getDimensionsFromRatio(ratio);
    let imagesDir, baseUrl, parentModel;

    if (folderId) {
      const folder = await Folder.findById(folderId).populate("album");
      if (!folder || !folder.album) {
        return res.status(404).json({ error: "Folder or album not found" });
      }

      const fullPath = await getFullFolderPath(folderId);
      imagesDir = path.join(
        __dirname,
        "uploads",
        currUser.username,
        folder.album.name,
        fullPath
      );

      baseUrl = `http://localhost:4000/uploads/${currUser.username}/${folder.album.name}/${fullPath}`;
      parentModel = Folder;
    } else {
      const album = await Album.findById(albumId);
      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }

      imagesDir = path.join(
        __dirname,
        "uploads",
        currUser.username,
        album.name
      );

      baseUrl = `http://localhost:4000/uploads/${currUser.username}/${album.name}`;
      parentModel = Album;
    }

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i].url;

      const response = await axios({
        method: "GET",
        url: imageUrl,
        responseType: "arraybuffer",
      });

      const imageBuffer = Buffer.from(response.data, "binary");
      const file = path.basename(imageUrl).split("-")[1]; // Original file name
      const filename = `${Date.now()}-${file}`;
      const outputPath = path.join(imagesDir, filename);

      try {
        await sharp(imageBuffer)
          .resize(width, height, {
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy,
          })
          .toFormat("jpeg")
          .toFile(outputPath);
      } catch (err) {
        console.error("Error processing image:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      const newImageUrl = `${baseUrl}/${filename}`;
      const newImage = {
        url: newImageUrl,
        name: file,
        addedAt: Date.now(),
      };

      // Pull old image and push the new one
      await parentModel.findByIdAndUpdate(folderId || albumId, {
        $pull: { images: { url: imageUrl } },
      });
      await parentModel.findByIdAndUpdate(folderId || albumId, {
        $push: { images: newImage },
      });
    }

    const updated = await parentModel
      .findById(folderId || albumId)
      .populate("folders");

    console.log("parent", updated);
    res.json({
      message: "Images updated successfully!",
      parent: updated,
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getFullFolderPath = async (folderId) => {
  let folderPath = "";
  let currentFolder = await Folder.findById(folderId).populate("parentFolder");

  while (currentFolder) {
    folderPath = path.join(currentFolder.name, folderPath);
    currentFolder = await Folder.findById(currentFolder.parentFolder).populate(
      "parentFolder"
    );
  }

  return folderPath;
};

const createFolder = async (req, res) => {
  try {
    const { name, albumId, parentFolderId, images } = req.body;

    if (!name || (!albumId && !parentFolderId)) {
      return res.status(400).json({
        error: "Name and either albumId or parentFolderId are required",
      });
    }

    // Fetch user details
    const currUser = await User.findOne({ userId: req.user.userId });
    if (!currUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let basePath;
    let albumName;
    if (parentFolderId) {
      const parentFolder = await Folder.findById(parentFolderId).populate(
        "album"
      );
      if (!parentFolder || !parentFolder.album) {
        return res
          .status(400)
          .json({ error: "Parent folder or album not found" });
      }
      const fullPath = await getFullFolderPath(parentFolderId);
      albumName = parentFolder.album.name;
      basePath = path.join(currUser.username, albumName, fullPath);
    } else {
      const album = await Album.findById(albumId);
      if (!album) return res.status(404).json({ error: "Album not found" });
      albumName = album.name;
      basePath = path.join(currUser.username, albumName);
    }

    const folderPath = path.join(__dirname, "uploads", basePath, name);
    fs.mkdirSync(folderPath, { recursive: true });

    const originalsDir = path.join(folderPath, "originals");
    const thumbnailsDir = path.join(folderPath, "thumbnails");

    // Make sure directories exist
    fs.mkdirSync(originalsDir, { recursive: true });
    fs.mkdirSync(thumbnailsDir, { recursive: true });

    let parentAlbum = null;
    if (!albumId) {
      const parentFolder = await Folder.findById(parentFolderId).populate(
        "album folders"
      );
      parentAlbum = parentFolder.album;
    }

    const newFolder = new Folder({
      name,
      album: parentAlbum || albumId,
      parentFolder: parentFolderId || null,
      images: [],
      thumbnail: "http://localhost:4000/temp/open-folder.png",
    });

    for (const img of images || []) {
      const filename1 = path.basename(img.url);
      const filename2 = path.basename(img.thumbnail);

      const sourcePath1 = path.join(
        __dirname,
        "uploads",
        basePath,
        "originals",
        filename1
      );
      const sourcePath2 = path.join(
        __dirname,
        "uploads",
        basePath,
        "thumbnails",
        filename2
      );

      const newPath1 = path.join(originalsDir, filename1);
      const newPath2 = path.join(thumbnailsDir, filename2);

      try {
        if (fs.existsSync(sourcePath1) && fs.existsSync(sourcePath2)) {
          await fs.promises.rename(sourcePath1, newPath1);
          await fs.promises.rename(sourcePath2, newPath2);
        } else {
          console.warn(`File not found: ${filename1}`);
        }
      } catch (error) {
        console.error("Error moving file:", error);
      }

      if (parentFolderId) {
        await Folder.findByIdAndUpdate(parentFolderId, {
          $pull: { images: { url: img.url } },
        });
      } else {
        await Album.findByIdAndUpdate(albumId, {
          $pull: { images: { url: img.url } },
        });
      }
      const fixedBasePath = basePath.replace(/\\/g, "/");

      const baseUrl = `http://localhost:4000/uploads/${fixedBasePath}/${name}`;
      const imageUrl1 = `${baseUrl}/originals/${filename1}`;
      const imageUrl2 = `${baseUrl}/thumbnails/${filename2}`;

      console.log("ori ", imageUrl1);
      console.log("thu ", imageUrl2);

      newFolder.images.push({
        url: imageUrl1,
        name: filename1.split("-")[1],
        addedAt: Date.now(),
        thumbnail: imageUrl2,
      });
    }

    const savedFolder = await newFolder.save();
    let parent;
    if (parentFolderId) {
      await Folder.findByIdAndUpdate(parentFolderId, {
        $push: { folders: savedFolder._id },
      });
      parent = await Folder.findById(parentFolderId);
    } else {
      await Album.findByIdAndUpdate(albumId, {
        $push: { folders: savedFolder._id },
      });
      parent = await Album.findById(albumId);
    }

    res.status(201).json({
      message: "Folder created successfully!",
      parent: parent,
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchAlbum = async (req, res) => {
  try {
    const { albumId, folderId } = req.body;
    if (!albumId && !folderId) {
      return res
        .status(400)
        .json({ message: "Album ID or folder ID is required" });
    }
    let curr;
    if (folderId) {
      console.log("folder", folderId);
      curr = await Folder.findById(folderId).populate("album folders");
    } else {
      curr = await Album.findById(albumId).populate("folders");
    }

    if (!curr) {
      return res
        .status(404)
        .json({ message: "Album not found", success: false });
    }

    res.status(200).json({
      curr: curr,
      message: "Album fetched successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching album:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFolderBreadcrumb = async (req, res) => {
  try {
    const { folderId } = req.body;

    if (!folderId) {
      return res.status(400).json({ message: "Folder ID is required" });
    }
    console.log(folderId);
    const breadcrumb = [];

    let currentFolder = await Folder.findById(folderId).populate(
      "parentFolder album"
    );

    const album = currentFolder.album;

    while (currentFolder) {
      breadcrumb.unshift({
        name: currentFolder.name,
        id: currentFolder._id,
      });
      currentFolder = currentFolder.parentFolder
        ? await Folder.findById(currentFolder.parentFolder).populate(
            "parentFolder"
          )
        : null;
    }

    console.log(album);

    res.status(200).json({ breadcrumb: breadcrumb, album: album });
  } catch (error) {
    console.error("Error fetching breadcrumb:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// API to process all images in the 'originals' folder
const processImagesWithWatermark = async (req, res) => {
  try {
    const { albumId, folderId, position = "southeast" } = req.body;

    if (!albumId && !folderId) {
      return res
        .status(400)
        .json({ message: "Either albumId or folderId is required" });
    }

    if (!req.files || !req.files.watermark) {
      return res.status(400).json({ message: "Watermark image is required" });
    }

    const watermarkBuffer = req.files.watermark.data;

    const currUser = await User.findOne({ userId: req.user.userId });
    if (!currUser) return res.status(404).json({ message: "User not found" });

    const parentModel = folderId ? Folder : Album;
    const parent = await parentModel
      .findById(folderId || albumId)
      .populate(folderId ? "album" : "");
    if (!parent)
      return res
        .status(404)
        .json({ message: `${folderId ? "Folder" : "Album"} not found` });

    const baseUploadPath = folderId
      ? path.join(
          __dirname,
          "uploads",
          currUser.username,
          parent.album.name.toString(),
          await getFullFolderPath(folderId)
        )
      : path.join(
          __dirname,
          "uploads",
          currUser.username,
          parent.name.toString()
        );

    const baseUrl = folderId
      ? `http://localhost:4000/uploads/${currUser.username}/${
          parent.album.name
        }/${await getFullFolderPath(folderId)}`
      : `http://localhost:4000/uploads/${currUser.username}/${parent.name}`;

    if (!fs.existsSync(baseUploadPath)) {
      return res
        .status(404)
        .json({ message: "path not found", baseUploadPath: baseUploadPath });
    }

    const updatedImages = [];

    for (const image of parent.images) {
      const originalPath = path.join(
        baseUploadPath,
        "originals",
        path.basename(image.url)
      );

      if (!fs.existsSync(originalPath)) {
        console.warn(`Image not found: ${originalPath}`);
        continue;
      }

      const originalImage = sharp(originalPath);
      const metadata = await originalImage.metadata();

      const resizedWatermarkBuffer = await sharp(watermarkBuffer)
        .resize({ width: Math.floor(metadata.width * 0.2) })
        .toBuffer();

      // Load original image and watermark
      const outputBuffer = await originalImage
        .composite([
          {
            input: resizedWatermarkBuffer,
            gravity: position,
            blend: "overlay",
            opacity: 0.75,
          },
        ])
        .toBuffer();

      // Overwrite original image
      const newFileName = `${Date.now()}-${path.basename(image.url)}`;
      const newFilePath = path.join(baseUploadPath, "originals", newFileName);

      const watermarkedDir = path.dirname(newFilePath);
      if (!fs.existsSync(watermarkedDir)) {
        fs.mkdirSync(watermarkedDir, { recursive: true });
      }

      // if (
      //   fs.existsSync(
      //     path.join(baseUploadPath, "originals", path.basename(image.url))
      //   )
      // ) {
      //   await fs.promises.unlink(
      //     path.join(baseUploadPath, "originals", path.basename(image.url))
      //   );
      // }

      await fs.promises.writeFile(newFilePath, outputBuffer);

      updatedImages.push(
        path.join(baseUploadPath, "originals", path.basename(image.url))
      );
      image.url = `${baseUrl}/originals/${newFileName}`;
      //await image.save();
      const watermarkBufferResizedForThumbnail = await sharp(watermarkBuffer)
        .resize({
          width: 20, // Smaller width to fit bottom-right corner
          height: 20,
          fit: sharp.fit.contain,
          position: sharp.strategy.attention,
        })
        .toBuffer();

      const thumbnailBuffer = await sharp(originalPath)
        .resize({
          width: 100,
          height: 100,
          fit: sharp.fit.cover,
          position: sharp.strategy.attention,
        })
        .composite([
          {
            input: watermarkBufferResizedForThumbnail,
            gravity: "southeast", // Specifically position at bottom-right
            blend: "over",
            opacity: 0.75,
          },
        ])
        .toBuffer();

      const thumbnailFileName = `${Date.now()}-${path.basename(image.url)}`;
      const thumbnailFilePath = path.join(
        baseUploadPath,
        "thumbnails",
        thumbnailFileName
      );

      // if (
      //   fs.existsSync(
      //     path.join(
      //       baseUploadPath,
      //       "thumbnails",
      //       path.basename(image.thumbnail)
      //     )
      //   )
      // ) {
      //   await fs.promises.unlink(
      //     path.join(
      //       baseUploadPath,
      //       "thumbnails",
      //       path.basename(image.thumbnail)
      //     )
      //   );
      // }

      const thumbnailDir = path.dirname(thumbnailFilePath);
      if (!fs.existsSync(thumbnailDir)) {
        fs.mkdirSync(thumbnailDir, { recursive: true });
      }

      await fs.promises.writeFile(thumbnailFilePath, thumbnailBuffer);

      updatedImages.push(
        path.join(baseUploadPath, "thumbnails", path.basename(image.thumbnail))
      );
      image.thumbnail = `${baseUrl}/thumbnails/${thumbnailFileName}`; // Assuming URL is relative
      await parent.save();

      // Store thumbnail URL in the response
    }

    for (const img of updatedImages) {
      try {
        if (fs.existsSync(img)) {
          await fs.promises.unlink(img);
        }
      } catch (deleteError) {
        console.warn(`Could not delete file ${img}:`, deleteError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Watermark applied to all images successfully",
      updatedImages,
    });
  } catch (error) {
    console.error("Error processing images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const watermarkPreview = async (req, res) => {
  try {
    const { position = "southeast", size = 20, mode = "overlap" } = req.body; // Default size is 20% of the original width

    // Check if watermark is provided
    if (!req.files || !req.files.watermark) {
      return res.status(400).json({ message: "Watermark image is required" });
    }

    const watermarkBuffer = req.files.watermark.data;

    // Define the path for the dummy image (dummy image stored at './uploads/temp')
    const dummyImagePath = path.join(__dirname, "../temp/2A2A0447REEDIT.jpg");

    // Check if the dummy image exists
    if (!fs.existsSync(dummyImagePath)) {
      return res.status(404).json({ message: "Dummy image not found" });
    }

    // Process watermark resizing based on user input size (percentage of the original image width)
    const originalImage = sharp(dummyImagePath);
    const metadata = await originalImage.metadata();
    const watermarkWidth = Math.floor(metadata.width * (size / 100)); // Resize watermark based on user size

    const resizedWatermarkBuffer = await sharp(watermarkBuffer)
      .resize({ width: watermarkWidth, fit: sharp.fit.inside })
      .toBuffer();

    // Apply watermark on the dummy image
    const outputBuffer = await sharp(dummyImagePath)
      .composite([
        {
          input: resizedWatermarkBuffer,
          gravity: position, // Apply watermark to the specified position
          blend: mode === "overlap" ? "over" : "overlay",
          opacity: mode === "overlap" ? 0.75 : 1,
        },
      ])
      .toBuffer();

    // Generate the output file name for the watermarked image
    const newFileName = `${Date.now()}-watermarked-dummy.jpg`;
    const newFilePath = path.join(__dirname, "../temp/", newFileName);

    // Ensure the directory exists
    const outputDir = path.dirname(newFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save the watermarked image
    await fs.promises.writeFile(newFilePath, outputBuffer);

    // Generate the URL for the watermarked image
    const watermarkedImageUrl = `http://localhost:4000/temp/${newFileName}`;

    res.status(200).json({
      success: true,
      message: "Watermark applied successfully",
      watermarkedImageUrl, // Send the URL of the watermarked image
    });

    setTimeout(() => {
      fs.unlink(newFilePath, (err) => {
        if (err) console.error("Error deleting preview file:", err);
      });
    }, 10000);
  } catch (error) {
    console.error("Error processing watermark preview:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addAlbum,
  addImages,
  getAlbums,
  deleteAlbum,
  deleteImage,
  pinAlbum,
  unpinAlbum,
  searchImage,
  editRatio,
  createFolder,
  fetchAlbum,
  deleteFolder,
  mergeAndDeleteFolder,
  getFolderBreadcrumb,
  processImagesWithWatermark,
  watermarkPreview,
};
