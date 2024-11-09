import mongoose from 'mongoose';

export const connectDB = async () => { 

    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to mongodb: ${conn.connection.host}`);
        
    }

    catch(error){
        console.log("Error connecting to mongodb. Error is: ", error.message);
        process.exit(1);
    }
}