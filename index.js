const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const multer = require("multer");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require('path'); 
const {uploadOnCloudinary,deleteFromCloudinary} = require('./utils/cloudinary');
const cloudinary = require("cloudinary").v2;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database is connected");
  } catch (err) {
    console.error("Database connection error:", err);
  }
};
app.use(
  cors({
    origin: 'https://blog-application-frontend-ashy.vercel.app',
    credentials: true,
  })
);
//middlewares
dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use('/images',express.static(path.join(__dirname,'/images')))


//cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//image upload
const storage = multer.diskStorage({
  destination:(req,file,fn)=>{
    fn(null,'/tmp');
  },
  filename: (req, file, fn) => {
    // Use the filename provided in req.body.uploadedFile or default to the original name
    const customFilename = req.body.uploadedFile;
    fn(null, customFilename);
  },
})

const upload= multer({storage: storage});


app.get('/api/test',(req,res)=>{
  res.status(200).json({message: "api working fine"})
})

app.post("/api/upload",upload.single('file'),async (req,res)=>{
  try{
    const localFilePath = req.file.path;

    const cloudinaryResult = await uploadOnCloudinary(localFilePath);

    if(cloudinaryResult && cloudinaryResult.secure_url){
      return res.status(200).json({
        message: "File has been uploaded successfully to Cloudinary!",
        cloudinaryUrl: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      });
    } 
    else{
      return res.status(500).json({
        message: "Failed to upload the file to Cloudinary",
        error: cloudinaryResult.error,
      });
    }
  }
  catch(error){
  console.error("Error during file upload:", error);
  return res.status(500).json({ message: "File upload failed", error: error.message })
  }
  
})

app.delete('/api/delete-file', async (req, res) => {
  const { publicId } = req.body;

  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });

    if(resource){
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",  
      });
  
      if (result.result === 'ok') {
        return res.status(200).json({ message: 'File deleted successfully!' });
      } else {
        return res.status(500).json({ message: 'Failed to delete file' });
      }
    }
    else{
      return res.status(404).json({message: "File not found"});
    }
    
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

app.put('/api/update',upload.single('file'),async(req,res)=>{
  try{
    const {oldPublicId} = req.body;
    const resource = await cloudinary.api.resource(oldPublicId, {
      resource_type: "image",
    });

    if(resource){
      const {oldPublicId} = req.body;
      const deleteSuccess = await deleteFromCloudinary(oldPublicId);
      if (!deleteSuccess) {
        return res.status(500).json({ message: "Failed to delete old media" });
      }
    }
    

    const localFilePath = req.file.path; 
    const newMedia = await uploadOnCloudinary(localFilePath);
    if(!newMedia) return res.status(500).json({message: "Failed to upload new media"})
    
    return res.status(200).json({
      message: "Media updated successfully",
      cloudinaryUrl: newMedia.secure_url,
      publicId: newMedia.public_id,
    });
  } 
  catch(error){
    return res.status(500).json({message: "Error updating media",error: error.message})
  }
})

app.listen(process.env.PORT, () => {
  connectDB();
  console.log("App is running on port" + process.env.PORT);
});
