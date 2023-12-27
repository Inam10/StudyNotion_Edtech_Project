const Course = require("../models/Course");
const Tag = require("../models/tags");
const User = require("../models/User");
const uploadImageToCloudinary = require("../utils/imageUploader");

//Create course handler
exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //get thumbnitl
    const thumbnil = req.files.thumbnilImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnil
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    //checkfor instructor
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor details", instructorDetails);

    //verify the userId and insturctorDetails._id are same or differnet

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found.",
      });
    }

    //check given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor details not found.",
      });
    }

    //upload image to cloudinary
    const thumbnilImage = await uploadImageToCloudinary(
      thumbnil,
      process.env.FOLDER_NAME
    );

    //create an entry for new course
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnil: thumbnilImage.secure_url,
    });

    ///add the new course to the user schema of instructor
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );
    //Update the tag to schema

    //return resposnse
    return res.status(200).json({
      success: false,
      message: "Course created successfully.",
      data: newCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Course",
      error: error.message,
    });
  }
};

//getAllCourses handler

exports.showAllCourses = async (req, res) => {
  try {
    //change the below incrementally
    const allCourses = await Course.find(
      {}
      // ,
      // {
      //   courseName: true,
      //   price: true,
      //   thumbnail: true,
      //   instructor: true,
      //   ratingAndReviews: true,
      //   studentEntolled: true,
      // }
    )
      .populate("instructor")
      .exec();

    //return res
    return res.status(200).json({
      success: true,
      message: "Data for all courses fetch successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch course data",
      error: error.message,
    });
  }
};
