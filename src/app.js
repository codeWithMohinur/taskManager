import express from "express";
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true , limit: "20kb"}));
app.use(express.static("public"));

app.use(cookieParser());

import userRoute from "./routs/user.route.js"

app.use("/api/v1/user", userRoute)

export { app };