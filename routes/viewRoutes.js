const express = require('express');
const {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
} = require('./../controllers/viewController');
const { protect, isLoggedIn } = require('./../controllers/authController');

const router = express.Router();

router.route('/').get(isLoggedIn, getOverview);
router.route('/tour/:slug').get(isLoggedIn, getTour);
router.route('/login').get(isLoggedIn, getLoginForm);
router.route('/me').get(protect, getAccount);

module.exports = router;
