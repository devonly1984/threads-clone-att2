"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDb } from "../mongoose";

interface Params {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
}
const createThread = async ({
    text, author, communityId, path
}: Params) => {
    connectToDb();
    try {
        const createdThread = await Thread.create(
            {
                text,
                author,
                community: null, //TODO: Update for community

            }
        );
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id }
        })
        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Issues with creating Thread ${error.message}`)
    }

}
const fetchPosts = async(pageNumber = 1,pageSize=20)=>{
    connectToDb();
    //posts with no parents
    const skipAmount = (pageNumber-1)*pageSize;

    const postsQuery = Thread.find({
        parentId: {$in: [null,undefined]}
    }).sort({createdAt: 'desc'})
    .skip(skipAmount).limit(pageSize).populate({
        path: 'author',
        model: User
    }).populate({
        path: 'children',
        populate: {
            path: 'author',
            model: User,
            select: "id name parentId image"
        }
    })
    const totalPostCount = await Thread.countDocuments({parentId: {$in: [null,undefined]}});
    const posts = await postsQuery.exec();
    const isNext = totalPostCount > skipAmount + posts.length;
    return {posts,isNext}

}
const fetchThreadById = async (id: string) => {
    connectToDb();
    try {
        const thread = await Thread.findById(id).populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        }).populate({
            path: 'children',
            populate: [
                {
                    path: "author",
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "_id id name parentId image"
                    }
                }
            ]
        }).exec();
        return thread;
//TODO Populate Community
    } catch (error:any) {
        throw new Error(`Error fetching Thread ${error.message}`);
    }
}
const addCommentToThread = async (threadId: string,
    commentText: string,
    userId: string,
    path: string
    )=>{
        connectToDb();
        try {
            const originalThread = await Thread.findById(threadId);
            if (!originalThread) {
                throw new Error("Thread not found")
            }
            const commentThread = new Thread({
                text:commentText,
                author: userId,
                parentId: threadId
            })
            //Save the new Thread
            const savedCommentThread = await commentThread.save();

            //update Original Thread to include comment
            originalThread.children.push(savedCommentThread._id);

            //save original Thread
            await originalThread.save();
            
            //refresh
            revalidatePath(path);
        } catch (error:any) {
            throw new Error(`Error adding comment to thread ${error.message}`)
        }
    }
export {
    createThread,
    fetchPosts,
    fetchThreadById,
    addCommentToThread
}