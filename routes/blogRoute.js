const express = require("express");
const { createBlog, updateBlog, getBlog, getAllBlogs, deleteBlog, likeBlog, dislikeBlog, uploadImages } = require("../controller/blogCtrl");
const { authMiddleware , isAdmin } =  require('../middlewares/authMiddleware');
const { blogImgResize, uploadPhoto } = require("../middlewares/uploadImages");

const router = express.Router();


router.put("/likes", authMiddleware, isAdmin, likeBlog );   // createBlog and updateBlog ke niche rkhnege is route ko to error: This id is not valid or not Found
router.put("/dislikes", authMiddleware, isAdmin, dislikeBlog);

router.post('/', authMiddleware, isAdmin, createBlog);

router.put("/upload/:id", authMiddleware, isAdmin,uploadPhoto.array("images", 2), blogImgResize, uploadImages);   //uploadImages ko blogCtrl se hi import krna h *** productCtrl se nhi


router.put("/:id", authMiddleware , isAdmin, updateBlog);
router.get("/:id", getBlog);
router.get("/", getAllBlogs);
router.delete("/:id", authMiddleware, isAdmin, deleteBlog);


module.exports = router;

