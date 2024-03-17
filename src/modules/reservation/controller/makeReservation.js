import { StatusCodes } from "http-status-codes";
import ErrorClass from "../../../utils/errorClass.js";
import { asyncErrorHandler } from "../../../utils/errorHandling.js";
import { allMessages } from "../../../utils/localizationHelper.js";
import reservationModel from "../../../../DB/models/Reservation.model.js";
import doctorModel from "../../../../DB/models/Doctor.model.js";
import payment from "../../../utils/payment.js";
import Stripe from "stripe";
/**
 * authorized: patient
 * logic: Check status of reservation if available? ❎ : ✔️ -> card -> status == "pending" ||| cash ->  status == "waiting"
 * input: reservationId
 * output: msg , reservation
 */
const makeReservation = asyncErrorHandler(async (req, res, next) => {
  const _id = req.params.reservationId;
  const reservation = await reservationModel.findOne({ _id });
  if (!reservation) {
    return next(
      new ErrorClass(
        allMessages[req.query.ln].NOT_FOUND,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (reservation.status.toString() != "available") {
    if (reservation.patientId?.toString() == req.user._id.toString()) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].RESERVATION_BEFORE,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    return next(
      new ErrorClass(
        allMessages[req.query.ln].NOT_AVAILABLE_RESERVATION,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  reservation.patientId = req.user._id;
  reservation.paymentMethod = req.body.paymentMethod;

  let from = Number(reservation.appointmentSeasion.from) - 2;
  let sessionFrom;
  from == -1? (sessionFrom = 23): from == -2? (sessionFrom = 24): from == 0? (sessionFrom = 0): (sessionFrom = from);
  // Session from get hours
  const hours = Math.floor(sessionFrom);
  // Session from get min
  const min = (sessionFrom - Math.floor(sessionFrom)) * 60;
  // Session time with from Session appointment
  let reservationDate = new Date(reservation.time);
  reservationDate.setHours(reservationDate.getHours() + hours);
  reservationDate.setMinutes(min);
  // check time now > Session appointment
  if (new Date() > reservationDate) {
    return next(
      new ErrorClass(
        allMessages[req.query.ln].RESERVATION_ERROR,
        StatusCodes.BAD_REQUEST
      )
    );
  }

  //check if method visa => pending or cash => waiting until doctor confirm
  if (req.body.paymentMethod.toString() == "card") {
    //status go to waiting
    const stripe = new Stripe(process.env.STRIP_KEY);
    const session = await payment({
      stripe,
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.email,
      metadata: {
        reservationId: `${reservation._id}`,
        doctorId: `${reservation.doctorId}`,
        // consultationFees: `${reservation.consultationFees}`,
        // appointmentFrom: String(reservation.appointmentSeasion.from),
        // appointmentTo: String(reservation.appointmentSeasion.to),
      },
      line_items: [
        {
          price_data: {
            currency: "EGP",
            product_data: {
              name: "Reservation",
              description: "Reservation",
            },
            unit_amount: reservation.consultationFees * 100,
          },
          quantity: 1,
        },
      ],
    });
    reservation.status = "pending";
    await reservation.save();
    return res.status(201).json({ message: "Done", url: session.url });
  }
  // cash
  reservation.status = "waiting";
  await reservation.save();
  // push to confirm
  await doctorModel.findOneAndUpdate(
    { _id: reservation.doctorId },
    {
      $push: { confirm: { _id } },
    },
    { new: true }
  );
  return res
    .status(StatusCodes.OK)
    .json({ message: allMessages[req.query.ln].RESERVATION_MAKE, reservation });
});
export default makeReservation;
