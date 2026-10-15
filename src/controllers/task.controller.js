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

const getTask = AsyncHandler(async(req, res) => {
    const userId = await req.user?._id
    if(!userId){
        throw new ApiError(400, "unauthorize user")
    }

    const task = await Task.find({userId})

    return res
    .status(201)
    .json(new ApiResponse(200, task, "get all task by user"))

});


const updateTask = AsyncHandler(async(req, res) => {
    const { taskId } = req.params

    const { title, description, status, priority} = req.body

    const userId = req.user?._id
    if(!userId){
        throw new ApiError(401, "unauthorize user")
    }

    const validateInfo = [title, description, status, priority]
    if(
        validateInfo.some((field) => typeof field !== "string" || field.trim() === "")
    ){
        throw new ApiError(400, "All fields are must be required")
    }

    const task = await Task.findByIdAndUpdate(
        {
            _id: taskId,
            userId: userId
        },
        {
            $set: {
                title: title.trim(),
                description: description.trim(),
                status: status.trim(),
                priority: priority.trim()
            },
        },
        {
            new: true
        }
    )

    if(!task){
        throw new ApiError(400, "Task not found or you are not authorized to update it")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            { task },
            "Update task successfully"
        )
    );

});

const deleteTask = AsyncHandler(async(req, res) => {
    const {taskId}  = req.params
    console.log(taskId)
    const userId = req.user?._id
    console.log(userId)
    if(!taskId){
        throw new ApiError(400, "enter a valid task id")
    }

    if(!userId){
        throw new ApiError(401, "unauthorize access")
    }

    const task = await Task.findByIdAndDelete(
        {
            _id: taskId,
            user: userId
        }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Deleted task successfully")
    )
});



export {
    createTask,
    getTask,
    updateTask,
    deleteTask
}