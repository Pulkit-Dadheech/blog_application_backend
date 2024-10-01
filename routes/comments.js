const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User')
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const verifyToken = require('../verifyToken');


//Create
router.post('/create',verifyToken,async(req,res)=>{
    try{
        const newComment = new Comment(req.body);
        const savedComment = await newComment.save();
        res.status(200).json(savedComment);
    }catch(e){
        res.status(500).json(e)
    }
})
router.put('/:id',verifyToken,async(req,res)=>{
    try{
        const updatedComment = await Comment.findByIdAndUpdate(req.params.id,{$set:req.body}, {new: true})
        console.log(updatedComment);
        res.status(200).json(updatedComment);
    }catch(e){
        res.status(500).json(e);
    }
})

router.delete('/:id',verifyToken,async(req,res)=>{
    try{
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json("Comment has been deleted");
    }catch(e){
        res.status(500).json(e);

    }
})

//Get Post details
router.get("/:id",async(req,res)=>{
    try{
        const comment = await Comment.findById(req.params.id);
        res.status(200).json(comment);
    }
    catch(e){
        res.status(500).json(e);
    }
})

// Get Posts
router.get("/",async(req,res)=>{
    try{
        const allComment =await Comment.find();
        res.status(200).json(allComment);
    }
    catch(e){
        res.status(500).json(e);
    }
})

router.get("/post/:postId",async(req,res)=>{
    try{
        const postComment = await Comment.find({postId:req.params.postId});
        res.status(200).json(postComment);
    }
    catch(e){
        res.status(500).json(e)
    }
})
// Get User Posts
router.get("/user/:userId",async(req,res)=>{
    try{
        const userComment =await Comment.find({userId:req.params.userId});
        res.status(200).json(userComment)
    }  
    catch(e){
        res.status(500).json(e)
    }
})

module.exports = router;