//find and replace Category to Brand
const express = require("express");
const { createBrand, updateBrand, deleteBrand, getBrand, getallBrand } = require("../controller/brandCtrl");    //1st change
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, isAdmin, createBrand);
router.put("/:id", authMiddleware, isAdmin, updateBrand);
router.delete("/:id", authMiddleware, isAdmin, deleteBrand);
router.get("/:id", getBrand);
router.get("/", getallBrand);


module.exports = router;