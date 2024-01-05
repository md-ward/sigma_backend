const User = require("../models/registeringModel");

async function addPhoneNumber(req, res) {
  try {
    const userId = req.userId;
    const { phone } = req.body;

    const user = await User.findById(userId);

    user.phone = phone;
    await user.save();

    res.status(200).send({ message: "Phone number added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ errorMessage: "Error adding phone number" });
  }
}

async function changeAccountStatus(req, res) {
  const userId = req.userId;
  const status = req.body.status;
  console.log(status);
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { accountStatus: status },
      { new: true, runValidators: true }
    );

    res.status(201).send({ user });
  } catch (error) {
    res.status(500).send({ message: `Something went wrong  : ${error}` });
  }
}

module.exports = {
  addPhoneNumber,
  changeAccountStatus,
};
