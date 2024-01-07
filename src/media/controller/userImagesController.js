const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const Images = require("../model/mediaModel");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/original");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
var upload = multer({ storage: storage });

async function uploadImage(req, res) {
  try {
    upload.single("image")(req, res, function (err) {
      const { imageAlt } = req.body;

      // console.log({ imageAlt });
      if (err instanceof multer.MulterError) {
        // A Multer error occurred while uploading
        console.log("Multer Error:", err);
        return res.status(500).json({ error: "Multer Error: " + err.message });
      } else if (err) {
        // An unknown error occurred
        console.log("Unknown Error:", err);
        return res.status(500).json({ error: "Unknown Error: " + err.message });
      }

      // File uploaded successfully
      let originalPath = req.file.path;

      // Generate and save thumbnail
      let thumbnailPath = generateThumbnail(originalPath);
      originalPath = originalPath.substring(3);
      thumbnailPath = thumbnailPath.substring(3);
      // console.log("File uploaded:", originalPath);
      // console.log("Thumbnail created:", thumbnailPath);
      const thumbnailUrl = new URL(
        thumbnailPath,
        `${req.protocol}://${req.get("host")}`
      );

      const originalUrl = new URL(
        originalPath,
        `${req.protocol}://${req.get("host")}`
      );

      // console.log(originalUrl)
      const Image_obj = new Images({
        image_alt: imageAlt,
        originalUrl: originalUrl.href,
        thumbnailUrl: thumbnailUrl.href,
      });

      Image_obj.save();
      console.log(Image_obj);

      return res
        .status(200)
        .json({ new_image: Image_obj, message: "Image uploaded successfully" });
    });
  } catch (error) {
    // Handle any other errors that occur during processing
    console.log("Error:", error);
    return res.status(500).json({ error: "Error: " + error.message });
  }
}

function generateThumbnail(filePath) {
  const thumbnailName = "thumbnail_" + path.basename(filePath);
  const thumbnailPath = path.join(
    path.dirname(filePath),
    "..",
    "thumbnails",
    thumbnailName
  );

  sharp(filePath)
    .resize(200, 200)
    .toFile(thumbnailPath, (err, info) => {
      if (err) {
        console.log("Error creating thumbnail:", err);
      } else {
        console.log("Thumbnail created:", thumbnailPath);
      }
    });

  return thumbnailPath;
}

async function getAllImages(req, res) {
  try {
    // const thumbnailFolder = path.join("src", "uploads", "thumbnails");

    const existed_images = await ImageSchema.find();

    res.status(200).send(existed_images);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ error: "Error: " + error.message });
  }
}

module.exports = {
  uploadImage,
  getAllImages,
};
