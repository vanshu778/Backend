// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
dotenv.config()
import connectDB from "./db/dbconnection.js";

connectDB()

.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO Db connection failed !!!", err);
})


/*
import express from "express"
const app = express()

(async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);

        })
    } catch(error){
        console.error("ERROR: ", error)
        throw error
    }
})()
    */