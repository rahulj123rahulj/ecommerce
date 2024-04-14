const Blog = require("../models/blogModel");
const validateMongodbid = require("../utils/validateMongodbid");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");


const createBlog = asyncHandler(async (req,res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json(newBlog);
    }
    catch (error) {
        throw new Error(error);
    }
});

const updateBlog = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbid(id);
    try {
        const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateBlog);
    }
    catch (error) {
        throw new Error(error);
    }
});

//fetch a blog
const getBlog = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbid(id);
    try {
        const getBlog = await Blog.findById(id)
        .populate("likes")
        .populate("dislikes");
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            {
                $inc: {numViews: 1 },   // here we need to update the numView also
            },
            { new: true }
        );
        res.json(getBlog);
    }
    catch (error) {
        throw new Error(error);
    }
});

const getAllBlogs = asyncHandler(async (req,res) => {
    try {
        const getBlogs = await Blog.find();
        res.json(getBlogs);
    }
    catch (error) {
        throw new Error(error);
    }
});

//copy updateBlog
const deleteBlog = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbid(id);
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        res.json(deletedBlog);
    }
    catch (error) {
        throw new Error(error);
    }
});

const likeBlog = asyncHandler(async (req,res) => {
    // console.log(req.body);             // router ko createBlog and updateBlog ke bhi upr rkhna h likeBlog router ko
    const { blogId } = req.body;
    validateMongodbid(blogId);

    //find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    //find the login user
    const loginUserId = req?.user?._id;        //from where we will get this loginUserId ?? == only login user can like or dislike the blogs so how we will get the user is loggedIn or not ?? == with the help of AUTHMIDDLEWARE we will get our loggedIn user
    // find if the user has liked the blog
    const isLiked = blog?.isLiked;
    // find if the user has disliked the blog
    const alreadyDisliked = blog?.dislikes?.find(
        ( (userId) => userId?.toString() === loginUserId?.toString() )  // === we have to match if the user is present is dislike array
    );

    // someone liked the post and the post is alreadydisliked then what we need to do is 1. remove the userId from the dislikes array
    if(alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loginUserId },
            isDisliked: false,              // 2. someone dislike the post then its disliked: true hoga so we changed  its disliked: false 
        },
        {new: true}
       );
      res.json(blog);
    }

    if(isLiked)
    {
        const blog = await Blog.findByIdAndUpdate(
            blogId, 
            {
            $pull: { likes: loginUserId },  // we pull loginUserId from likes ...when someone is already liked and again it clicks on liked then we need to remove the like == 1.we need to remove userId from likes array 
            isLiked: false,                 // 2. we need to make isLiked:false
            },
            {new: true}
            );
            res.json(blog);
    }
    else
    {
        const blog = await Blog.findByIdAndUpdate(
            blogId, 
            {
            $push: { likes: loginUserId },
            isLiked: true,
            },
            {new: true}
            );
            res.json(blog);
    }
});

//copy likeBlog code
const dislikeBlog = asyncHandler(async (req,res) => {
    // console.log(req.body);             // router ko createBlog and updateBlog ke bhi upr rkhna h likeBlog router ko
    const { blogId } = req.body;
    validateMongodbid(blogId);

    //find the blog which you want to be liked
    const blog = await Blog.findById(blogId);
    //find the login user
    const loginUserId = req?.user?._id;        //from where we will get this loginUserId ?? == only login user can like or dislike the blogs so how we will get the user is loggedIn or not ?? == with the help of AUTHMIDDLEWARE we will get our loggedIn user
    // find if the user has liked the blog
    const isDisLiked = blog?.isDisliked;                  //1st. change in line (dyan se isDisliked l is small in last one)
    // find if the user has disliked the blog
    const alreadyLiked = blog?.likes?.find(               //2nd change
        ( (userId) => userId?.toString() === loginUserId?.toString() )  // === we have to match if the user is present is dislike array
    );

    // someone liked the post and the post is alreadydisliked then what we need to do is 1. remove the userId from the dislikes array
    if(alreadyLiked) {                                   //3rd change
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId },               //4th change
            isLiked: false,              // 5th change // 2. someone dislike the post then its disliked: true hoga so we changed  its disliked: false 
        },
        {new: true}
       );
      res.json(blog);
    }

    if(isDisLiked)                      //6th change
    {
        const blog = await Blog.findByIdAndUpdate(
            blogId, 
            {
            $pull: { dislikes: loginUserId },  //7th change   // we pull loginUserId from likes ...when someone is already liked and again it clicks on liked then we need to remove the like == 1.we need to remove userId from likes array 
            isDisliked: false,                 //8th change... model m bhi isDisliked likha h   // 2. we need to make isLiked:false
            },
            {new: true}
            );
            res.json(blog);
    }
    else
    {
        const blog = await Blog.findByIdAndUpdate(
            blogId, 
            {
            $push: { dislikes: loginUserId },      //9th change
            isDisliked: true,                      //10th change
            },
            {new: true}
            );
            res.json(blog);
    }
});


//productCtrl se copy kiya
const uploadImages = asyncHandler(async (req,res) => {               
    // console.log(req.files);
    const { id } = req.params;   // this is for product.....by this we find our product and upload our images
    validateMongodbId(id);
    try
    {
        const uploader = (path) => cloudinaryUploadImg(path,"images");
        const urls = [];
        const files = req.files;
        for(const file of files)
        {
            const { path } = file;
            const newpath = await uploader(path);
            console.log(newpath);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const findBlog = await Blog.findByIdAndUpdate(    //1st.change
            id,
             {
             images: urls.map((file) => {
                return file;
             }),
           },
            {
                new: true,
            }
                    //image:  it is in our model
        );
        res.json(findBlog);                          //2nd change
    }
    catch (error) {
        throw new Error(error);
    }
 });
 
 

module.exports = { createBlog , updateBlog , getBlog , getAllBlogs , deleteBlog , likeBlog , dislikeBlog, uploadImages };



// validateMongodbid in the 

//     updateBlog
//     getBlog
//     deleteBlog
//     likeBlog ....