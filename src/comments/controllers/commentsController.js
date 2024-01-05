const CommentsModel = require("../models/commentsModel");
const User = require("../../registeration/models/registeringModel");

exports.addComment = async (req, res) => {
  const userId = res.locals.userId;
  const productId = req.params.productId;
  const { comment } = req.body;

  console.log({ productId, comment });
  try {
    const newComment = new CommentsModel({
      customer: userId,
      product: productId,
      comment: comment,
    });

    await newComment.save();
    let name = await User.findById(userId, "name -_id");

    res.status(201).json({
      comments: {
        customer: name.name,
        productId,
        comment,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};
exports.getProductComments = async (req, res) => {
  const productId = req.params.productId;
  const limit = parseInt(req.query.limit) || 5;
  console.log(limit);

  const totalComments = await CommentsModel.countDocuments({
    product: productId,
  });

  try { 
    let comments = await CommentsModel.find({ product: productId }, "-__v")
      .populate("customer", "name -_id")
      .limit(limit)
      .lean();

    comments = comments.map((comment) => {
      return {
        ...comment,
        customer: comment.customer ? comment.customer.name : null,
      };
    });
    // console.log({ comments, totalComments });

    res.status(200).json({ comments, totalComments });
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({ message: "Failed to retrieve comments" });
  }
};
