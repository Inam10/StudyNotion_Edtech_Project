const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetPassword token
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req
    const email = req.body.email;
    //check user for this email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "Your email is not registrated",
      });
    }
    //generte token
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //create url

    const url = `http://localhost:3000/update-password/${token}`;

    //send mail containing url
    await mailSender(
      email,
      "Password reset link",
      `Password reset Link ${url}`
    );

    //response return

    return res.json({
      success: true,
      message: "Email sent successfully , please check your email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reset password",
    });
  }
};

//reset password

exports.restPassword = async (req, res) => {
  try {
    //data fetch
    const { password, confirmPassword, token } = req.body;
    //validation
    if (password != confirmPassword) {
      return res.json({
        success: false,
        message: "Password not matching",
      });
    }

    //get user details from db by using token
    const userDetails = await User.findOne({ token: token });

    //if no entry - invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is invalid",
      });
    }
    //token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "This token is expired , please regenerate your token",
      });
    }

    //password hash
    const hashPassword = await bcrypt.hash(password, 10);

    //password update
    await User.findOneAndUpdate(
      { token: token },
      { password: hashPassword },
      { new: true }
    );
    //return response
    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reset passoword here.",
    });
  }
};
