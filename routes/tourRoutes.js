const express = require('express');
const {
  aliasTopTours,
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
  uploadTourImages,
  resizeTourImages,
} = require('./../controllers/tourControllers');
const { protect, restrictTo } = require('./../controllers/authController');
const reviewRouter = require('./reviewRoutes');
/********** Router-level middleware **************/
const router = express.Router();

// nested routes with express
router.use('/:tourId/reviews', reviewRouter);

// router.param('id', checkID);
// router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// tours-Whithin?distance=...&latlng=...&unit=mi ---> mess y

router.route('/distances/:latlng/unit/:unit').get(getDistance);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    updateTour,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
