import axios from 'axios';
import { showalert } from './alerts';
const stripe = Stripe(
  'pk_test_51Qmu6BLL0tKMT6BrnaNJf9n99mKlw7scskqUxMwy56GQnWYtgr1vYQZkHV8vwqtpdddldnafzkxb2VCOL8ixuuff00AdTUU53p',
);
// import Stripe from "stripe";

// export const booktour = async (tourid) => {
//   console.log(tourid);

//   const session = await axios(
//     `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourid}`,
//   );
//   console.log(session);

//   await stripe.redirectToCheckout({
//     sessionId: session.data.session.id,
//   });
// };

export const booktour = async (tourid) => {
  try {
    const session = await axios.get(
      `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourid}`,
    );

    if (!stripe) {
      throw new Error('Stripe failed to initialize.');
    }

    // Redirect to checkout
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id, // Ensure you're using the correct key
    });
  } catch (err) {
    console.error('Error:', err);
    showalert('error', err);
  }
};
