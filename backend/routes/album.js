const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const tempFolder = path.join(__dirname, "../temp");
console.log("temp:", tempFolder);
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}
//multer for file uploads
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       console.log("Uploading to:", tempFolder); // Debugging
//       cb(null, tempFolder);
//     },
//     filename: (req, file, cb) => {
//       console.log("Uploading file:", file.originalname); // Debugging
//       cb(null, file.originalname);
//     },
//   }),
// });
const { isAuth } = require("../middleware/auth");
const {
  addImages,
  addAlbum,
  getAlbums,
  deleteAlbum,
  deleteImage,
  pinAlbum,
  unpinAlbum,
  searchImage,
  editRatio,
  createFolder,
  fetchAlbum,
  getFolderBreadcrumb,
  deleteFolder,
  processImagesWithWatermark,
  watermarkPreview,
} = require("../controller/album");

router.post("/addAlbum", isAuth, addAlbum);
router.post("/addImages", isAuth, addImages);
router.post("/all", isAuth, getAlbums);
router.post("/deleteAlbum", isAuth, deleteAlbum);
router.post("/deleteImage", isAuth, deleteImage);
router.post("/pin", isAuth, pinAlbum);
router.post("/unpin", isAuth, unpinAlbum);
router.post("/searchImage", isAuth, searchImage);
router.post("/editRatio", isAuth, editRatio);
router.post("/createFolder", isAuth, createFolder);
router.post("/getAlbum", fetchAlbum);
router.post("/deleteFolder", isAuth, deleteFolder);
router.post("/add-watermark", isAuth, processImagesWithWatermark);
router.post("/watermarkPrevie", isAuth, watermarkPreview);

// Get breadcrumbs for the given album
router.post("/breadcrumb", isAuth, getFolderBreadcrumb);
router.post("/searchImage", (req, res) => {
  console.log("Req Headers:", req.headers);
  console.log("Req Body:", req.body);
  res.json({ message: "Testing request data" });
});

module.exports = router;
