const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        unique: true
    },
    description:{
        type:String,
        required:true,
        unique:true
    },
    photo:{
        type:String,
        required: false,
    },
    username:{
        type:String,
        required:true,
    },
    userId:{
        type:String,
        required:true,
    },
    categories:{
        type:Array,
    },
    publicId:{
        type: String,
    }
},{timestamps:true})
 
module.exports = mongoose.model("Post",PostSchema);