const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//createRating
exports.createRating = async (req, res) => {
  try {
    //get userid
    const userId = req.user.id;

    //fetch data form body
    const { rating, review, courseId } = req.body;

    //check user is  enrolled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }

    //check if user already reviewed the course
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (!alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is already reviewed by the user",
      });
    }

    //create rating review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //update course with rating review
    const updatedCourseDetails = await Course.findById(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: RatingAndReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    //return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review created successfully".ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status.json({
      success: false,
      message: error.message,
    });
  }
};

//Average rating
exports.getAverageRating = async (req, res) => {
  try {
    //get course id
    const courseId = req.body.courseId;

    //calculate avg rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    //return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,
        averageRating: result(0).averageRating,
      });
    }

    //if no rating
    return res.status(200).json({
      success: true,
      message: "Average rating is 0 , till now",
      averageRating,
    });
  } catch (error) {
    console.log(error);
    return res.status.json({
      success: false,
      message: error.message,
    });
  }
};

//get all rating

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();

    //retrun response

    return res.status(200).json({
      success: false,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } 
  catch (error) {
    console.log(error);
    return res.status.json({
      success: false,
      message: error.message,
    });
  }
};
