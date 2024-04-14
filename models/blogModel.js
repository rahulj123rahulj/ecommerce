const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title: {
        type:String,
        required:true,
    },
    description: {
        type:String,
        required:true,
    },
    category: {
        type:String,
        required:true,
    },
    numViews: {
        type: Number,
        default: 0,
    },
    isLiked: {
        type: Boolean,
        default: false
    },
    isDisliked: {
        type: Boolean,
        default: false
    },
    likes: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
    ],
    dislikes: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User",
        },
    ],
    // image: {
    //     type: String,
    //     default: "https://cdn.websites.hibu.com/97df2096307b4f18a0f85bf1ed3dceb8/dms3rep/multi/blog-c341ba1a.png",
    // },
    author: {
        type: String,
        default: "Admin",
    },
    images: [],
}, 
{
    toJSON: {
        virtuals: true,
    }, 
    toObject: {
        virtuals: true,
    },
    timestamps: true,
}
);

//Export the model
module.exports = mongoose.model('Blog', blogSchema);