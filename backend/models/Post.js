const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  title:{
    type:String,
    required:true
  },

  content:{
    type:String,
    required:true
  },

  anime:{
    type:String,
    required:true
  },

  spoiler:{
    type:Boolean,
    default:false
  },
  image: {
  type: String,
  default: ""
},

 reactions: {
  peak: { type: Number, default: 0 },
  sad: { type: Number, default: 0 },
  shock: { type: Number, default: 0 },
  mindblown: { type: Number, default: 0 },
  love: { type: Number, default: 0 }
},

reactionUsers: [
  {
    userId: String,
    reaction: String
  }
]
},{timestamps:true});

module.exports = mongoose.model("Post",postSchema);