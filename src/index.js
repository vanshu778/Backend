// require('dotenv').config({path:'./env'})
// import dotenv from "dotenv";
// dotenv.config()
// import connectDB from "./db/dbconnection.js";

// connectDB()

// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`Server is running at port: ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO Db connection failed !!!", err);
// })


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

import express from "express";
import dotenv from "dotenv";
dotenv.config(); // This should load your .env variables

// dotenv.config({ path: './env' });
import connectDB from "./db/dbconnection.js";
// const app = express();
import app from "./app.js"; // Import the app instance
// import app from "app.js";
// Other imports and app setup
// DB Is Connected Asynchronously So It Will Also Return Promise

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error in Server Setup", error);
      throw error;
    });
    //     app.listen(process.env.PORT || 4000, () => {
    //         console.log(`Server is running on port ${process.env.PORT || 4000}`);
    //       });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed", err);
  });