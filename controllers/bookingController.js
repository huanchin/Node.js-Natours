const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.getCheckoutSession = async (req, res, next) => {
  try {
    // 1) Get currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    // 2) Create checkout session
    const transformedItems = [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.description, //description here
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ], //only accepts live images (images hosted on the internet),
          },
        },
      },
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/`, //user will be redirected to this url when payment is successful. home page
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, //user will be redirected to this url when payment has an issue. tour page (previous page)
      customer_email: req.user.email,
      client_reference_id: req.params.tourId, //this field allows us to pass in some data about this session that we are currently creating.
      line_items: transformedItems,
      mode: 'payment',
    });

    // 3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    next(err);
  }
};
