const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    lastname:{
        type:String,
        required:true,
        // unique:true,
        // index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        default: "user",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    cart: {
        type: Array,
        default: [],
    },
    address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    refreshToken: {
        type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
 },
 {
    timestamps: true,
 }
);

userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) {
        next();    // here we are checking if password is modified then we need to encypt it again otherwise not need to encypt it again
    }
    const salt = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// we are going to create LOGIN FUNCTUNALITY then you have to match that password for that
userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password);
};
userSchema.methods.createPasswordResetToken = async function() {
    const resettoken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest("hex");
                            // we need to set the passwordResetExpires
    this.passwordResetExpires = Date.now()+ 30 * 60 * 1000;    // 10 minutes
    return resettoken;
};
//Export the model
module.exports = mongoose.model('User', userSchema);