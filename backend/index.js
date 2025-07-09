const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./config/database");
const authRoutes = require("./routes/auth");
const cloudinary = require("./config/cloudinary");
const albumRoutes = require("./routes/album");
const fileUpload = require("express-fileupload");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("uploads"));
app.use(
  "/uploads/",
  express.static(path.join(__dirname, "controller/uploads"))
);
app.use("/temp/", express.static(path.join(__dirname, "temp")));
app.use(fileUpload());

db.connect();
cloudinary.cloudinaryConnect();

app.use("/api/auth", authRoutes);
app.use("/api/album", albumRoutes);
app.listen(process.env.PORT || 4000, "0.0.0.0", () => {
  console.log(
    `Server is running on port ${process.env.PORT ? process.env.PORT : 4000}`
  );
});
