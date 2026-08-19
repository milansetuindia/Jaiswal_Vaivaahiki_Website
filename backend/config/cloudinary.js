const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

module.exports = cloudinary;

