import axios from 'axios';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51OyaAXP2rWUbUuZTNtf6LVDHHh9AZNL7jhhtuhjxzIN0KUeIH7IHGI3Sb8E1TLHyHhW8xV4RYVvxSE1j2kGCzMHw00G0gVxgl1',
  );
  // 1) Get checkout session from API
  const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
  // console.log(session);
  // 2) Create checkout form + charge credit card
};
