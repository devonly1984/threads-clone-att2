import mongoose,{connect} from 'mongoose';

let isConnected = false;


export const connectToDb = async ()=>{
    mongoose.set('strictQuery',true);

    if (!process.env.MONGODB_URI ) return console.log('MongoDB URL not found');

    if (isConnected) return console.log('Already connected to DB');
    try {
        await connect(process.env.MONGODB_URI!)    
        isConnected = true;
        console.log("Connection Successful")
    } catch (error:any) {
        throw new Error(`Something went wrong with the connection ${error.message}`)
    }
    
}