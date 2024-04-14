// find and Replace   Brand to Brand
const Brand = require("../models/brandModel");     //1st line change 
const asyncHandler = require("express-async-handler");
const validateMongodbId = require("../utils/validateMongodbid.js");

const createBrand = asyncHandler(async (req,res) => {
    try {
        const  newBrand = await Brand.create(req.body);
        res.json(newBrand);
    }
    catch (error) {
        throw new Error(error);
    }
});

const updateBrand = asyncHandler(async (req,res) => {
    const { id } = req.params; 
    validateMongodbId(id);
    try {
        const  updatedBrand = await Brand.findByIdAndUpdate(id,req.body, {
            new: true,
        })
        res.json(updatedBrand);
    }
    catch (error) {
        throw new Error(error);
    }
});

const deleteBrand = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id); 
    try {
        const  deletedBrand = await Brand.findByIdAndDelete(id);
        res.json(deletedBrand);
    }
    catch (error) {
        throw new Error(error);
    }
});

//copy createBrand
const getBrand = asyncHandler(async (req,res) => {
    const { id } = req.params;
    validateMongodbId(id);
    try {
        const  getaBrand = await Brand.findById(id);
        res.json(getaBrand);
    }
    catch (error) {
        throw new Error(error);
    }
});

const getallBrand = asyncHandler(async (req,res) => {
    try {
        const  getallBrand = await Brand.find();
        res.json(getallBrand);
    }
    catch (error) {
        throw new Error(error);
    }
});


module.exports = { createBrand , updateBrand, deleteBrand, getBrand, getallBrand };



// validateMongodbId in this route
//     updateBrand
//     deleteBrand
