const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

// schema 是用 JSON 的方式來告訴 mongo 說 document 的資料會包含哪些型態
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], // built-in validator
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'], // built-in validator
      minlength: [10, 'A tour name must have more or equal then 10 characters'], // built-in validator
      // validate: [validator.isAlpha, 'A tour name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        // built-in validator
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'], // built-in validator
      max: [5, 'Rating must be below 5.0'], // built-in validator
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price.'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // custom validator
          // this only points to current doc on NEW document creation (not for update)
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description.'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image.'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// In Mongoose, a virtual is a property that is not stored in MongoDB. Virtuals are typically used for computed properties on documents.
tourSchema.virtual('durationWeeks').get(function (next) {
  return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// Middleware (also called pre and post hooks) are functions which are passed control during execution of asynchronous functions.
// Mongoose has 4 types of middleware: document middleware, model middleware, aggregate middleware, and query middleware.
// 1) Document Middleware: runs before .save() and .create()
// In document middleware functions, this refers to the document.
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', function(next) {
//   console.log("doc will save...");
//   next();
// })

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// })

// 2) Query Middleware
// In query middleware functions, this refers to the current query.
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  // this.start = Date.now();
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

// Populating tour guides
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    // select: '-__v -passwordChangedAt',
  });
  next();
});

// 3) Aggregation middleware
// In aggregate middleware, this refers to the aggregation object
tourSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  next();
});

// Compile Schema 變成 Model，如此可以透過這個 Model 建立和儲存 document
// 會在 mongo 中建立名為 tour 的 collection
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// create a document
//   const testTour = new Tour({
//     name: 'The Forest Hiker',
//     rating: 4.7,
//     price: 497,
//   });

//   testTour
//     .save()
//     .then((doc) => console.log(doc))
//     .catch((err) => console.log('ERROR 💥:', err));
