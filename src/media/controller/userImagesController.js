const multer = require("multer");
// const sharp = require("sharp");
const path = require("path");
const Images = require("../model/mediaModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/original");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const uploadImagesMiddleware = upload.array("images");

async function handleUploadedImages(req, res, next) {
  try {
    uploadImagesMiddleware(req, res, async function (err) {
      const { imageAlt } = req.body;
      console.log(req.body);

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
      const imagePromises = req.files.map(async (file) => {
        let originalPath = file.path;
        originalPath = originalPath.substring(3);
        console.log(originalPath);
        const originalUrl = new URL(
          originalPath,
          `${req.protocol}://${req.get("host")}`
        );

        const image = new Images({
          image_alt: imageAlt,
          originalUrl: originalUrl.href,
        });

        await image.save();
        return image._id;
      });

      const imageIds = await Promise.all(imagePromises);

      console.log(`images `, imageIds);
      req.imageIds = imageIds;
      console.log("images ", imageIds);
      next();
    });
  } catch (error) {
    // Handle any other errors that occur during processing
    console.log("Error:", error);
    return res.status(500).json({ error: "Error: " + error.message });
  }
}

// function generateThumbnail(filePath) {
//   const thumbnailName = "thumbnail_" + path.basename(filePath);
//   const thumbnailPath = path.join(
//     path.dirname(filePath),
//     "..",
//     "thumbnails",
//     thumbnailName
//   );

//   sharp(filePath)
//     .resize(200, 200)
//     .toFile(thumbnailPath, (err, info) => {
//       if (err) {
//         console.log("Error creating thumbnail:", err);
//       } else {
//         console.log("Thumbnail created:", thumbnailPath);
//       }
//     });

//   return thumbnailPath;
// }

async function getAllImages(req, res) {
  try {
    const existed_images = await Images.find();

    res.status(200).send(existed_images);
  } catch (error) {
    console.log("Error:", error);
    return res.status(500).json({ error: "Error: " + error.message });
  }
}

module.exports = {
  uploadImagesMiddleware,
  handleUploadedImages,
  getAllImages,
};
