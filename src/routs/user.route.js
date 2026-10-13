import { Router } from "express";
import { changePassword, loginUser, logoutUser, refreshTokenAccess, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { validJWT } from "../middlewares/auth.middleware.js";
import { createTask, getTask} from "../controllers/task.controller.js";
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

router.route("/refresh-token").post(refreshTokenAccess)

router.route("/change-password").post(
    validJWT, 
    changePassword
)

router.route("/create-task").post(
    validJWT,
    createTask
)

router.route("/get-Task").get(
    validJWT,
    getTask
)

export default router 