const mongoose=require('mongoose');
let articleSchema=mongoose.Schema({
    title:{type:String,required:true},
    author:{type:String,required:true},
    description:{type:String},
    tags:{type:Array},
    //catalogue:{type:String,required:true},
    catalogueId:{type:mongoose.Schema.ObjectId},
    postDate:{type:String},
    meta:{
      createTime:{type:Date,default:Date.now},
      updateTime:{type:Date,default:Date.now}
    }
});
articleSchema.pre('save',function(next){
  if(this.isNew)
    this.meta.createTime=this.meta.updateTime=Date.now();
  else
    this.meta.updateTime=Date.now();
  next();
});

module.exports=mongoose.model('articles',articleSchema);
