import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const infoOfDB = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`Connected to the database || DB HOST: ${infoOfDB.connection.host}`);
    }catch(error){
        console.log("Error connecting to the database: ", error);
        process.exit(1);
    }
}

export { connectDB };