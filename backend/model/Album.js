const mongoose = require("mongoose");
require("./Folder");

const AlbumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  thumbnail: {
    type: String,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      thumbnail: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
      clickedAt: {
        type: Date,
        default: null,
      },
    },
  ],
  folders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
  ],
});

AlbumSchema.pre("save", function (next) {
  if (this.images.length > 0) {
    this.thumbnail = this.images[0].url; // Set first image as thumbnail
  } else {
    this.thumbnail = null;
  }
  next();
});

// **Update Thumbnail When Images are Modified**
AlbumSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  if (doc.images.length > 0) {
    await doc.updateOne({ thumbnail: doc.images[0].url }); // Set first image as thumbnail
  } else {
    await doc.updateOne({ thumbnail: null }); // No images left, remove thumbnail
  }
});

const Album = mongoose.model("Album", AlbumSchema);

module.exports = Album;
