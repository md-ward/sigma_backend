const { Schema, model, default: mongoose } = require("mongoose");

const ImageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  image_alt: { type: String, require: false },
  originalUrl: { type: String, require: true },
  thumbnailUrl: { type: String, require: true },
  uploadedAt: { type: Date, default: Date.now },
});

const Images = mongoose.model("Images", ImageSchema);

module.exports = Images;
