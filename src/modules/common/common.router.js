import Router from "express";
import { auth } from "../../middleware/auth.js";
import { fileUpload, filesValidation } from "../../utils/multer.js";
import commonEndPoint from "./common.endpoint.js";
import changePasswordController from "./controller/changePassword.js";
import confirmChangeEmailController from "./controller/confirmChangeEmail.js";
import changeEmailController from "./controller/changeEmail.js";
import logoutController from "./controller/logout.js";
import updatePersonalInfoController from "./controller/updatePersonalInfo.js";
import getUserController from "./controller/getUser.js";
import getAllUsersController from "./controller/getAllUsers.js";

const router = Router();

// .route("/:id")
router
  .route("/")
  .get(auth(commonEndPoint.getAllUser), getAllUsersController)
  .put(
    auth(commonEndPoint.update),
    fileUpload(filesValidation.image).single("image"),
    updatePersonalInfoController
  );
router.get("/:id", auth(commonEndPoint.getUser), getUserController);
router.patch(
  "/changePassword",
  auth(commonEndPoint.update),
  changePasswordController
);
router.patch(
  "/changeEmail",
  auth(commonEndPoint.update),
  changeEmailController
);
router.patch(
  "/confirmChangeEmail",
  auth(commonEndPoint.update),
  confirmChangeEmailController
);
router.patch("/logout", auth(commonEndPoint.update), logoutController);

export default router;
