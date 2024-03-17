import schedule from "node-schedule";
import reservationModel from "../../DB/models/Reservation.model.js";

export const checkPaymentStatus = () => {
    schedule.scheduleJob(
      '*/30 * * * *',
      async function () {
        const currentDate = new Date();
        const pendingReservations = await reservationModel.find({ status: 'pending' });
        pendingReservations.filter(async reservation => {
          const updatedAtPlusFiveMinutes = new Date(reservation.updatedAt.getTime() + 5 * 60 * 1000);
          if ( currentDate > updatedAtPlusFiveMinutes ) {
            await reservationModel.updateOne(
              { _id: reservation._id },
              { $unset: { paymentMethod: 1 }, status: "available", patientId: null }
            );
          }
          ;
        });
      }
    )
  };