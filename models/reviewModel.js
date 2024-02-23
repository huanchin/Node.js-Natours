// reviews: review, rating, createdAt, ref to tourID, ref to User
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      // required: [true, 'A review must have a rating'], // built-in validator
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      // require: [true, 'A review must have a create date'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      require: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Review must belong to a user.'],
    },
  },
  {
    // for virtual properties
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

// static methods vs. instance methods
// statics are the methods defined on the Model. methods are defined on the document (instance).

// this points to current model
// aggregate should be used on model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log('💰', stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

// 'save' is document middleware functions
// this refers to the Document
// this.constructor points to the Model
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.tour);
});

// 在這裡只能用 pre 不能用 post, 如果使用 post, 在 delete 執行後則無法再 gain access to this.findOne(query) (因為 post 時，query 已經送出)
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // get access to current review document
  this.curReview = await this.findOne();
  next();
});

// findByIdAndUpdate & findByIdAndDelete are actually just shorthands for findOneAndUpdate & findByIdAndDelete
// 'findOneAndUpdate' & 'findOneAndDelete' are query middleware
// this refers to the query
reviewSchema.post(/^findOneAnd/, async function (next) {
  console.log('⭐️⭐️', this.curReview.tour);
  await this.curReview.constructor.calcAverageRatings(this.curReview.tour);
});

// Compile Schema 變成 Model，如此可以透過這個 Model 建立和儲存 document
// 會在 mongo 中建立名為 tour 的 collection
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
