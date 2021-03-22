const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new schema({
    fullname: {
      type: String,
      required: [true, "Your fullname"],
      trim: true,
    },
    tempid:{
      type:String,
      required:true
    },
    username: {
      type: String,
      required: [true, "Your username"],
      trim: true,
      unique: true,
    },
    isAdmin:{
      type:Boolean,
      default:false
    },
    unseennotice:[{ type: mongoose.Schema.ObjectId,ref:"Notice"}],    
    email: {
      type: String,
      required: [true, "Your email"],
      trim: true,      
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],   
      
    },
    socketId:{
      type:[String]
    },    
    avatar: {
      type: String,
      default:
        "https://kkleap.github.io/assets/default.jpg",      
    },
    bio: String,
    website: String,
    subscribers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],    
    subscribedto:[{type: mongoose.Schema.ObjectId, ref: "User" }],    
    videos: [{ type: mongoose.Schema.ObjectId, ref: "Video" }],   
  });

  userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id,tempid:this.tempid }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };
  userSchema.methods.updatePassword = async function (password,tempid){
    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash(password, salt);
    this.password = pass;
    this.tempid = tempid;
  }
  userSchema.methods.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  
  module.exports = mongoose.model("User", userSchema);
  