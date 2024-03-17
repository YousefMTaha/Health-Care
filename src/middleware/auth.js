import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { asyncErrorHandler } from "../utils/errorHandling.js";
import ErrorClass from "../utils/errorClass.js";
import patientModel from "../../DB/models/Patient.model.js";
import { allMessages } from "../utils/localizationHelper.js";
import doctorModel from "../../DB/models/Doctor.model.js";

export const Roles = {
  admin: "Admin", 
  doctor: "Doctor", 
  Patient: "Patient",
};
Object.freeze(Roles);
export const auth = (roles = []) => {
  return asyncErrorHandler(async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].TOKEN_NOT_EXIST,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].BEARER_KEY,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    const token = authorization.split(process.env.BEARER_KEY)[1];
    if (!token) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].TOKEN_NOT_EXIST,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE);
    if (!decoded?.id) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].INVALID_PAYLOAD,
          StatusCodes.BAD_REQUEST
        )
      );
    }

    let user, userRole;
    if (decoded.role == Roles.doctor) {
      user = await doctorModel.findById(decoded.id);
      userRole = Roles.doctor
    }
    if (decoded.role == Roles.Patient) {
      user = await patientModel.findById(decoded.id);
      userRole = Roles.Patient
    }
    if (!user) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].USER_NOT_EXIST,
          StatusCodes.NOT_FOUND
        )
      );
    }
    if (!roles.includes(decoded.role)) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].UNAUTHORIZED,
          StatusCodes.FORBIDDEN
        )
      );
    }
    if (!user.loggedIn) {
      return next(
        new ErrorClass(
          allMessages[req.query.ln].LOGIN_FIRST,
          StatusCodes.UNAUTHORIZED
        )
      );
    }
    req.user = user;
    req.userRole = userRole;
    return next();
  });
};
