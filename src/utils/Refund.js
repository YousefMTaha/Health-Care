import stripePackage from "stripe";
import reservationModel from "../../DB/models/Reservation.model.js";
import { allMessages } from "./localizationHelper.js";

export const refund = async (reservationId) => {
  try {
    const stripe = stripePackage(process.env.STRIP_KEY);
    const reservation = await reservationModel.findById(reservationId);

    const refund = await stripe.refunds.create({
      payment_intent: reservation.paymentId,
    });

    return {
      message: allMessages.en.REFUND_SUCCESS,
      refund,
      success: true,
    };
  } catch (error) {
    return {
      // message: allMessages.en.REFUND_FAILED,
      message: error.message,
      success: false,
    };
  }
};
// import stripePackage from "stripe";
// import reservationModel from "../../../../DB/models/Reservation.model.js";

// export const refund = async (req, res, next) => {
//   try {
//     const { id } = req.params; // reservation ID

//     const stripe = stripePackage(process.env.STRIP_KEY);
//     const reservation = await reservationModel.findById(id);

//     await stripe.refunds.create({
//       payment_intent: reservation.paymentId,
//     });
//   } catch (error) {
//     console.log({ errMessage: error.message });
//   }
// };
