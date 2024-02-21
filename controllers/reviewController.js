const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

/********** Route Handlers **************/
// exports.getAllReviews = async (req, res, next) => {
//   try {
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     const reviews = await Review.find(filter);

//     res.status(200).json({
//       status: 'success',
//       // requestedAt: req.reqestTime,
//       results: reviews.length,
//       data: {
//         reviews,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };
exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review);

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
