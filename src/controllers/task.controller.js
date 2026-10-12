import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiRequestHandler.js"
import {AsyncHandler} from "../utils/AsyncHandler.js";
import {Task} from "../models/task.model.js";
import { User } from "../models/user.model.js"

const createTask = AsyncHandler(async(req, res) => {
    const {title, description, status, priority} = req.body
    console.log(req.body)
   
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400, "unauthorized user")
    }



const requiredFields = [title, description, status, priority];

if (
    requiredFields.some(
        (field) =>
            typeof field !== "string" ||
            field.trim() === ""
    )
) {
    throw new ApiError(400, "All fields are required");
}

const user = await User.findById(userId._id)

if(!user){
    throw new ApiError(400, "User not found")
}

const task = await Task.create({
    title: title.trim(),
    description: description.trim(),
    status: status.trim(),
    priority: priority.trim(),
    userId: user._id
})
console.log(task)

    return res
    .status(201)
    .json(
        new ApiResponse(201, {task}, "Successfully create a task by user")
    )
});

export {
    createTask
}