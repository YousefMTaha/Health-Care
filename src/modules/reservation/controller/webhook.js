import Stripe from "stripe";
import reservationModel from "../../../../DB/models/Reservation.model.js";
import { asyncErrorHandler } from "../../../utils/errorHandling.js";
import doctorModel from "../../../../DB/models/Doctor.model.js";
import { createMail, html } from "../../../utils/email.js";
import sendEmail from "../../../utils/email.js";
const webhook = asyncErrorHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  const event = Stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.ENDPOINT_SECRET
  );

  switch (event.type) {
    case "checkout.session.completed":
      const reservationId = event.data.object.metadata.reservationId;
      const doctorId = event.data.object.metadata.doctorId;
      const paymentId = event.data.object.payment_intent;
      await reservationModel.updateOne(
        {
          _id: reservationId,
        },
        {
          status: "waiting",
          paymentId: paymentId,
        }
      );
      await doctorModel.updateOne(
        { _id: doctorId },
        {
          $addToSet: {
            confirmReservation: reservationId,
          },
        }
      );

      return res.status(200).json({ message: "done" });

      break;
    case "charge.refunded":
      const refundObject = event.data.object;
      if (refundObject.refunded) {
        // Send the refund receipt to the user
        await sendEmail({
          to: refundObject.billing_details.email,
          subject: "Refund",
          html: html(refundObject.receipt_url),
        });
        await reservationModel.updateOne(
          {
            paymentId: refundObject.payment_intent,
          },
          {
            paymentId: null,
          }
        );
      }
      return res.status(200).json({ message: "done" });

      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
});

export default webhook;
