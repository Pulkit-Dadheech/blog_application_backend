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
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    }catch(e){
        res.status(500).json(e)
    }
})
router.put('/:id',verifyToken,async(req,res)=>{
    try{
        const updatedUser = await Post.findByIdAndUpdate(req.params.id,{$set:req.body}, {new: true})
        console.log(updatedUser);
        res.status(200).json(updatedUser);
    }catch(e){
        res.status(500).json(e);
    }
})

router.delete('/:id',verifyToken,async(req,res)=>{
    try{
        await Post.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({postId:req.params.id})
        res.status(200).json("Post has been deleted");
    }catch(e){
        res.status(500).json(e);

    }
})

//Get Post details
router.get("/:id",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }
    catch(e){
        res.status(500).json(e);
    }
})

// Get Posts
router.get("/",async(req,res)=>{
    const query= req.query;
    try{
        const searchFilter = {
            title:{$regex: query.search,$options:"i"}
        }
        const allPosts =await Post.find(query.search?searchFilter:null) ;
        console.log(allPosts);
        res.status(200).json(allPosts);
    }
    catch(e){
        res.status(500).json(e);
    }
})


// Get User Posts
router.get("/user/:userId",async(req,res)=>{
    try{
        const allPosts =await Post.find({userId:req.params.userId});
        res.status(200).json(allPosts)
    }  
    catch(e){
        res.status(500).json(e)
    }
})


module.exports = router;