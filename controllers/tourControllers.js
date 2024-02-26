const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
/********** Route Handlers **************/
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price',
//     });
//   }
//   next();
// };

// exports.checkID = (req, res, next, val) => {
//   if (Number(val) > tours.length - 1) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };
exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  console.log('alias');
  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = async (req, res, next) => {
//   try {
//     // console.log(req.reqestTime);
//     //******* build the query *******/
//     // // 1A) Filtering
//     // const queryObj = { ...req.query };
//     // const excludedFields = ['page', 'sort', 'limit', 'fields'];
//     // excludedFields.forEach((el) => delete queryObj[el]);

//     // // console.log(req.query, queryObj);

//     // // 1B) Advanced filtering
//     // // { difficulty: 'easy', duration: { $gte: 5 } }
//     // // { difficulty: 'easy', duration: { gte: '5' } }
//     // // gte, gt, lte, lt
//     // let queryStr = JSON.stringify(queryObj);
//     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

//     // // console.log(JSON.parse(queryStr));

//     // let query = Tour.find(JSON.parse(queryStr));
//     // // const query = Tour.find()
//     // //   .where('duration')
//     // //   .equals(5)
//     // //   .where('difficulty')
//     // //   .equals('easy');

//     // // 2) Sorting
//     // // 127.0.0.1:8000/api/v1/tours?sort=-price,-ratingsAverage
//     // if (req.query.sort) {
//     //   const sortBy = req.query.sort.split(',').join(' ');
//     //   // console.log(sortBy);
//     //   query = query.sort(sortBy);
//     // } else {
//     //   query = query.sort('-createdAt _id');
//     // }

//     // // 3) Limiting fields
//     // // 127.0.0.1:8000/api/v1/tours?fields=name,duration,difficulty,price
//     // if (req.query.fields) {
//     //   const fields = req.query.fields.split(',').join(' ');
//     //   query = query.select(fields);
//     // } else {
//     //   query = query.select('-__v');
//     // }

//     // // 4) Pagination
//     // const page = req.query.page * 1 || 1; // convert string to number
//     // const limit = req.query.limit * 1 || 100;
//     // const skip = (page - 1) * limit;
//     // // 127.0.0.1:8000/api/v1/tours?page=2&limit=10
//     // // 1-10, page 1, 11-20, page 2, 21-30, page 3...
//     // query = query.skip(skip).limit(limit);

//     // if (req.query.page) {
//     //   const numTours = await Tour.countDocuments();
//     //   if (skip >= numTours) throw new Error('This page does not exist');
//     // }
//     //******* execute the query *******/
//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const tours = await features.query;
//     //******* send response *******/
//     res.status(200).json({
//       status: 'success',
//       // requestedAt: req.reqestTime,
//       results: tours.length,
//       data: {
//         tours,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = async (req, res, next) => {
//   try {
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     // Tour.findOne({ _id: req.params.id })

//     if (!tour) {
//       return next(new AppError(`No tour found with that ID`, 404));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.createTour = factory.createOne(Tour);
// exports.createTour = async (req, res, next) => {
//   try {
//     // const newTour = new Tour(req.body);
//     // newTour.save()
//     const newTour = await Tour.create(req.body);

//     res.status(201).json({
//       status: 'success',
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = async (req, res, next) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!tour) {
//       return next(new AppError(`No tour found with that ID`, 404));
//     }

//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = async (req, res, next) => {
//   try {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//       return next(new AppError(`No tour found with that ID`, 404));
//     }

//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// 聚合管線 Aggregation Pipeline 是透過 Aggregation framework 將 document 進入一個由多個階段（stage）組成的管線，可以對每個階段的管線進行分組、過濾等功能，在經過一系列的處理之後，輸出相應的聚合結果。
exports.getTourStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'easy' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = Number(req.params.year);
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    next(err);
  }
};

// tours-within/233/center/34.108776,-118.223653/unit/mi
exports.getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    // θ = s/r, where θ is the subtended angle in radians, s is arc length, and r is radius.
    const radians = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400,
        ),
      );
    }
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radians] } },
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getDistance = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.00062137 : 0.001;

    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400,
        ),
      );
    }

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances,
      },
    });
  } catch (err) {
    next(err);
  }
};
