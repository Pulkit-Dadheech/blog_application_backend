const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User')
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const verifyToken = require('../verifyToken');

router.put('/:id',verifyToken,async(req,res)=>{
    try{
        if(req.body.password){
            const salt = bcrypt.genSaltSync(10);
            req.body.password = bcrypt.hashSync(req.body.password, salt);
            const updatedUser = await User.findByIdAndUpdate(req.params.id,{$set:req.body}, {new: true})
            res.status(200).json(updatedUser)
        }
    }
    catch(e){
        res.status(500).json(e);
    }
})

router.delete('/:id',verifyToken,async(req,res)=>{
    try{
        await User.findByIdAndDelete(req.params.id);
        await Post.deleteMany({userId:req.params.id});
        await Comment.deleteMany({userId:req.params.id});
        res.clearCookie("token", { sameSite: "none", secure: true }).status(200);
        res.status(200).json("User has been deleted");
    }catch(e){
        res.status(500).json(e);

    }
})

router.get("/:id",async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        const{password,...info} = user._doc;
        res.status(200).json(info);
    }
    catch(e){
        res.status(500).json(e);
    }
})

module.exports = router;