import Stripe from "stripe";

async function payment({
  stripe = new Stripe(process.env.STRIP_KEY),
  payment_method_types = ["card"],
  mode = "payment",
  customer_email,
  metadata = {},
  discounts = [],
  line_items = [],
} = {}) {
  const fiveMinutesFromNow = new Date();
  fiveMinutesFromNow.setMinutes(fiveMinutesFromNow.getMinutes() + 30);

  const session = await stripe.checkout.sessions.create({
    expires_at: Math.floor(fiveMinutesFromNow.getTime() / 1000), // Convert milliseconds to seconds
    payment_method_types,
    mode,
    customer_email,
    metadata,
    cancel_url: "https://www.google.com",
    success_url: "https://www.google.com",
    discounts: [],
    metadata,
    line_items,
  });

  return session;
}
export default payment;
