// import
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// collegamento a Cloudinary con le chiavi del .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// uploader per una cartella: png, jpg, jpeg e webp fino a 2 MB (il link arriva in req.file.path)
const createUploader = (folder) =>
  multer({
    storage: new CloudinaryStorage({
      cloudinary,
      params: {
        folder,
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
      },
    }),
    limits: { fileSize: 2 * 1024 * 1024 },
  });

// un uploader per gli avatar e uno per i prodotti
module.exports = {
  uploadAvatar: createUploader("storesquad/avatars"),
  uploadProductImage: createUploader("storesquad/products"),
};
