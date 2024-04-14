const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const { default: mongoose } = require("mongoose");
const slugify = require('slugify');
const validateMongodbId = require("../utils/validateMongodbid");


const User = require("../models/userModel");
const cloudinaryUploadImg = require("../utils/cloudinary");
const fs = require("fs");

const createProduct = asyncHandler(async (req,res) => {
    try {

        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }

        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    }
    catch (error) {
        throw new Error(error);
    }
   
});

//product updation
const updateProduct = asyncHandler(async (req,res) => {
    const id = req.params;
    validateMongodbId(id);
    try {
        
        if(req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, req.body, {
            new: true,
        });

    res.json(updateProduct);
    } catch (error) {
        throw new Error(error);
    }
});

// copy updateProduct
const deleteProduct = asyncHandler(async (req,res) => {
    const { id } = req.params;          // {} nhi h actual video m we have added it
    validateMongodbId(id); 
    try {
        
        const deleteProduct = await Product.findOneAndDelete(id);

    res.json(deleteProduct);
    } catch (error) {
        throw new Error(error);
    }
});


// fetch all products
const getaProduct = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    }
    catch (error) {
        throw new Error(error);
    }
});

    // const getAllProduct = asyncHandler(async (req,res) => {
    //     // console.log(req.query);
    //     try {
    //       const queryObj = { ...req.query };
    //       const excludeFields = ["page", "sort", "limit", "fields"];
    //       excludeFields.forEach( (el) => delete queryObj[el]);                         //we will delete this above array fields if it is available in req.query...in el we get page,sort.....
    //       console.log(queryObj);
    //      const query = {};
    //      // Loop through each key-value pair in the input object
    //      Object.entries(queryObj).forEach(([key, value]) => {
    //          // Extract the operator and field name
    //          const [field, operator] = key.split('[').map(part => part.replace(']', ''));        
    //          // Convert the operator to MongoDB format and add it to the query object
    //          query[field] = { [`$${operator}`]: Number(value) };
    //      });
         
    //     // console.log(query);    //console.log(JSON.parse(queryStr));

    //     const query2 = Product.find(query);
    //     const product = await query2;

    //     // const resultQuery = Product.find(query);          //query....queryObj tha phle
    //     // const product = await resultQuery;
        
    //     res.json(product);
    //     // const getAllProducts = await Product.find(queryObj);

    //     //1st way) const getAllProducts = await Product.find(req.query);

    //     //2nd way) const getAllProducts = await Product.find({
    //     //         brand: req.query.brand,
    //     //         category: req.query.category,
    //     // });
    //     //3rd  way)
    //     // const getAllProducts = await Product.where("category").equals(
    //     //     req.query.category
    //     //     );
        
        
    //         // res.json(getAllProducts);
    //     }
    //     catch (error) {
    //         throw new Error(error);
    //     }
    // });

    const getAllProduct = asyncHandler(async (req, res) => {
        try {
            //filtering
            const queryObj = { ...req.query };
            const excludeFields = ["page", "sort", "limit", "fields"];
            excludeFields.forEach((el) => delete queryObj[el]);
    
            // Build the query object based on the input query parameters
            let query = {};
            for (const [key, value] of Object.entries(queryObj)) {
                if (key.includes("[gte]") || key.includes("[lte]")) {
                    const [field, operator] = key.split(/\[|\]/).filter(Boolean);
                    query[field] = query[field] || {};
                    query[field][`$${operator}`] = Number(value);
                } else {
                    query[key] = value;
                }
            }
    
            //sorting
            // if(req.query.sort) {
            //     const sortBy = req.query.sort.split(",").join(" ");
            //     query = query.sort(sortBy);
            // }
        
            //     query = query.sort("-createdAt");
            

            // const products = await Product.find(query);
            let sortBy = "-createdAt"; // Default sort by createdAt if sort parameter is not provided
        if (req.query.sort) {
            const sortFields = req.query.sort.split(",");
            sortBy = sortFields.join(" ");
        }
        
        //limiting the fields
        // if(req.query.fields) {
        //     const fields = req.query.fields.split(",").join(" ");
        //     query = query.select(fields);
        // } else {
        //     query = query.select ('__v');
        // }
        let selectFields = '-__v'; // Default to only include __v field if fields parameter is not provided
        if (req.query.fields) {
            const fields = req.query.fields.split(",").join(" ");
            selectFields = fields;
        }

        //pagination
        //we have 3 things to do here........page,limit,on one page how many product we can show and then skip
        const page = req.query.page;;
        const limit = req.query.limit;
        const skip = (page -1) * limit;       //we are getting skip with the help of page and limit
        // query = query.skip(skip).limit(limit);
        if(req.query.page) {
            const productCount = await Product.countDocuments();
            if(skip >= productCount) throw new Error("This page does not exists");
        }
        console.log(page,limit,skip); 
        
        const products = await Product.find(query).select(selectFields).sort(sortBy).skip(skip).limit(limit);
        // const products = await Product.find(query).sort(sortBy);
            res.json(products);
        } catch (error) {
            throw new Error(error);
        }
    });
    

const addToWishList = asyncHandler(async (req,res) => {
    // to add the product in wishList we need 2 things
    const { _id } = req.user;   // so we need to pass authMiddleware from this route
    const { prodId } = req.body;

    try {
        const user =await User.findById(_id);   //User ko import bhi krna h   // from here we will get our user who is logged in 
        const alreadyadded = user.wishlist.find((id)=> id.toString() === prodId );
        if(alreadyadded) {   // the product which we want to add ...if it is already this its user's wishlist then
            let user = await User.findByIdAndUpdate(
                _id, 
                {
                $pull: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        } 
        else {                 // otherwise push
            let user = await User.findByIdAndUpdate(
                _id, 
                {
                $push: { wishlist: prodId },
                },
                {
                    new: true,
                }
            );
            res.json(user);
        }

    } 
    catch (error) {
        throw new Error(error);
    }
});

const rating = asyncHandler(async (req,res) => {
    const { _id } =  req.user;  // we need loggedIn user
    const { star, prodId, comment } = req.body;
    
    try {
        const product = await Product.findById(prodId);
         let alreadyRated = product.ratings.find(
             (userId) => userId.postedby.toString() === _id.toString()
        );
        if(alreadyRated) 
        {
            // first. we need to find the ratedProduct
            const updateRating = await Product.updateOne(
                {
                ratings: {$elemMatch: alreadyRated },       // with the help of alreadyRated this we will find out our product rating
                },
                {
                    $set: { "ratings.$.star": star, "ratings.$.comment": comment },
                },
                {
                    new: true,
                }
            );
            // res.json(updateRating);
        }
        else
        {
            // fresh rating functionality
            const rateProduct = await Product.findByIdAndUpdate(
                prodId, 
                {
                 $push: {
                    ratings: {
                        star: star,
                        comment: comment,
                        postedby: _id,
                    },
                  },
                },
               { new: true, }
            );
            // res.json(rateProduct);
        }

    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev,curr) => prev + curr , 0);
    let acutalRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(             // productModel.js m totalrating h that we need to update now
        prodId, 
        {
        totalrating: acutalRating, 
        },
        { new: true }
    );
    res.json(finalproduct);

    }
    catch 
    {
        throw new Error(error);
    }
});



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
       const findProduct = await Product.findByIdAndUpdate(
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
       res.json(findProduct);
   }
   catch (error) {
       throw new Error(error);
   }
});

module.exports = { createProduct , getaProduct , getAllProduct , updateProduct ,deleteProduct,
     addToWishList , rating, uploadImages, };



// validateMongodbId in this
//         updateProduct
//         deleteProduct
//         getaProduct

// this validateMongodbId bd m add kiya hmne (pta nii is file m only)

        