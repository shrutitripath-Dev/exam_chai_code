import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    const pr= process.env.PORT || 800;
    app.listen(pr , ()=>{ 
        console.log(`Server is running at PORT : ${pr}`);
    })
    app.on(`error`,(error)=>{
        console.error("Error connecting to MongoDB:", error);
        throw error
    })
})
.catch((err)=>{
    console.log('MONGODB is failed',err)
})
