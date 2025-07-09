const mongoose = require("mongoose");
const Album = require("./Album");

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  albums: [
    {
      type: mongoose.Types.ObjectId,
      ref: Album,
    },
  ],
  pinnedAlbums: [
    {
      type: mongoose.Types.ObjectId,
      ref: Album,
    },
  ],
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
