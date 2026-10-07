import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { validJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.none(),
    registerUser
)

router.route("/login").post(loginUser)

router.route("/logout").post(
    validJWT,
    logoutUser
)

export default router 