"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDb } from "../mongoose";
import Thread from "../models/thread.model";
interface Params {
    userId:string;
    username:string;
    name:string;
    bio:string;
    image:string;
    path:string
}

const updateUser = async({userId,username,
    name,
    bio,
    image,
    path}:Params):Promise<void>=>{
    try {
        connectToDb();
        await User.findOneAndUpdate({
            id: userId
        },{
            username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded:true
        },
        {upsert:true});
        if (path==='/profile/edit') {
            revalidatePath(path);
        }
    } catch (error:any) {
        throw new Error(`Issue with updated User ${error.message}`)
    }
}
const fetchUser = async(userId:string)=>{
    try {
        connectToDb();
        return await User.findOne({id: userId})
        //.populate({
          //  path: 'communities',
           // model: Community,

        //})
    } catch (error:any) {
        throw new Error(`Failed to fetch User ${error.message}`)
    }
}
const fetchUserPosts = async(userId:string)=> {
    //TODO:POPULATE COMMUNITY
    try {
        connectToDb(); 
        const threads = await User.findOne({id:userId}).
        populate({
            path: "threads",
            model: Thread,
            populate: {
                path: "children",
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }

        })
        return threads;   
    } catch (error:any) {
        throw new Error(`Failed to fetch User Posts${error.message}`)
    }
}
export {
    updateUser,
    fetchUser,
    fetchUserPosts
}