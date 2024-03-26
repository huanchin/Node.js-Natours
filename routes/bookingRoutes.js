const express = require('express');
const { getCheckoutSession } = require('./../controllers/bookingController');
const { protect } = require('./../controllers/authController');

const router = express.Router();

router.get('/checkout-seesion/:tourId', protect, getCheckoutSession);

module.exports = router;
