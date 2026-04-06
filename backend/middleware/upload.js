const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Storage for post images
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "otakuverse/posts",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
  },
});

// Storage for avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "otakuverse/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto" }],
  },
});

const uploadPost   = multer({ storage: postStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { uploadPost, uploadAvatar };