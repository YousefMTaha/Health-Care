import { asyncErrorHandler } from "../../../utils/errorHandling.js";
import patientModel from "../../../../DB/models/Patient.model.js";;
import doctorModel from "../../../../DB/models/Doctor.model.js";
import getAllUsers from "../function/getAllUsers.js";

const getAllUsersController = asyncErrorHandler(async(req, res, next) => {
  if (req.originalUrl.includes("patient"))
  getAllUsers(patientModel)(req, res, next);
  else getAllUsers(doctorModel)(req, res, next);
});

export default getAllUsersController;

