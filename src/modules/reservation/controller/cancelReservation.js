import { StatusCodes } from "http-status-codes";
import ErrorClass from "../../../utils/errorClass.js";
import { asyncErrorHandler } from "../../../utils/errorHandling.js";
import { allMessages } from "../../../utils/localizationHelper.js";
import reservationModel from "../../../../DB/models/Reservation.model.js";
import doctorModel from "../../../../DB/models/Doctor.model.js";
import { refund } from "../../../utils/Refund.js";
/**
 * authorized: Doctor
 * logic: if status cancelled? ✔️ : ❎ Change status of reservation -> status == "cancelled" & delete patient from this reservation
 * input: reservationId
 * output: msg
 */
export const cancelReservationDoctor = asyncErrorHandler(
  async (req, res, next) => {
    const { reservationId } = req.params;
    const reservation = await reservationModel.findOne({
      _id: reservationId,
    });
    if (!reservation) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].NOT_FOUND,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    // if (reservation.status == "confirmed") {
    //   return next(
    //     new ErrorClass(
    //       allMessages[req.query.ln].RESERVATION_COMPLETE,
    //       StatusCodes.BAD_REQUEST
    //     )
    //   );
    // }
    // push to rejected and pull from confirm
    await doctorModel.findOneAndUpdate(
      { _id: reservation.doctorId },
      {
        $push: {
          rejected: { reservationId, patientId: reservation.patientId },
        },
        $pull: { confirm: reservationId },
      },
      { new: true }
    );
    await reservationModel.updateOne(
      { _id: req.params.reservationId },
      {
        $unset: { paymentMethod: 1 },
        status: "available",
        patientId: null,
      }
    );

    if (reservation.paymentMethod == "card") {
      // let refundErrMsg;
      const refundOperation = await refund(reservationId);
      return res.status(StatusCodes.ACCEPTED).json({
        message: allMessages[req.query.ln].RESERVATION_CANCEL,
        refundMsg: refundOperation.message,
        reservation,
      });
    }

    return res.status(StatusCodes.ACCEPTED).json({
      message: allMessages[req.query.ln].RESERVATION_CANCEL,
      reservation,
    });
  }
);
/**
 * authorized: Patient
 * logic: if status confirmed from doctor? ❎ Can change status of reservation -> status == "available"
 *                                       : ✔️ Change status of reservation if time < time session -> status == "available"
 * input: reservationId
 * output: msg
 */
export const cancelReservationPatient = asyncErrorHandler(
  async (req, res, next) => {
    const reservation = await reservationModel.findOne({
      _id: req.params.reservationId,
    });
    if (!reservation) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].NOT_FOUND,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    //1 ==> 23 | 2 ==> 24
    // Session from -> edit time
    let from = Number(reservation.appointmentSeasion.from) - 2;
    let sessionFrom;
    from == -1
      ? (sessionFrom = 23)
      : from == -2
      ? (sessionFrom = 24)
      : from == 0
      ? (sessionFrom = 0)
      : (sessionFrom = from);
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
          allMessages[req.query.ln].RESERVATION_CANCEL_ERROR,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    if (
      reservation.status.toString() != "confirmed" &&
      reservation.paymentMethod == "cash"
    ) {
      //Can change status of reservation -> status == "available"
      await reservationModel.updateOne(
        { _id: req.params.reservationId },
        { $unset: { paymentMethod: 1 }, status: "available", patientId: null }
      );
      await reservation.save();
      //Delete from array confirm in doctor model
      await doctorModel.findOneAndUpdate(
        { _id: reservation.doctorId },
        {
          $pull: { confirm: req.params.reservationId },
        },
        { new: true }
      );
      return res.status(StatusCodes.ACCEPTED).json({
        message: allMessages[req.query.ln].RESERVATION_CANCEL,
      });
    }
    if (reservation.status == "rejected") {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].RESERVATION_CANCEL_BEFORE,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    if (reservation.status == "Completed") {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].RESERVATION_COMPLETE,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    /**
     * if the session is today and the patient wants to cancel:
     * can cancel anytime before the session but 30 minutes before the session starts
     */
    //  30 min
    let before = new Date(reservationDate.toISOString());
    before = new Date(before.setMinutes(before.getMinutes() - 30));
    //Same day of reservation or day before in one case (Before reservation day (one issue can face))
    if (
      new Date().toISOString().slice(0, 10) ==
        reservationDate.toISOString().slice(0, 10) ||
      reservationDate.getUTCDate() - new Date().getUTCDate() == 1
    ) {
      //check cancellation before 30 min ..
      if (before > new Date()) {
        // cannot cancel
        return next(
          new ErrorClass(
            allMessages[req.query.ln].RESERVATION_CANCEL_UNAUTHORIZED,
            StatusCodes.BAD_REQUEST
          )
        );
      }
    }
    // if befor 30 min from session -> patient can cancel
    await reservationModel.updateOne(
      { _id: req.params.reservationId },
      { $unset: { paymentMethod: 1 }, status: "available", patientId: null }
    );
    await reservation.save();
    //Delete from array confirm in doctor model
    await doctorModel.findOneAndUpdate(
      { _id: reservation.doctorId },
      {
        $pull: { confirm: req.params.reservationId },
      },
      { new: true }
    );

    console.log(reservation);
    if (reservation.paymentMethod == "card") {
      console.log("refund");
      // let refundErrMsg;
      const refundOperation = await refund(req.params.reservationId);

      return res.status(StatusCodes.ACCEPTED).json({
        message: allMessages[req.query.ln].RESERVATION_CANCEL,
        refundMsg: refundOperation.message,
        reservation,
      });
    }

    return res.status(StatusCodes.ACCEPTED).json({
      message: allMessages[req.query.ln].RESERVATION_CANCEL,
      // test: "test",
    });
  }
);
