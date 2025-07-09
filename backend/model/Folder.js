const mongoose = require("mongoose");

const FolderSchema = new mongoose.Schema({
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
      createdAt: {
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
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Folder",
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
  },
  thumbnail: {
    type: String,
    required: true,
  },
});

const Folder = mongoose.model("Folder", FolderSchema);

module.exports = Folder;
