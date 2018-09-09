const mongoose=require('mongoose');
let userSchema=mongoose.Schema({
    username:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    roles:{type:Array},
    meta:{
      createTime:{type:Date,default:Date.now},
      updateTime:{type:Date,default:Date.now},
    }
},{versionKey: false});
userSchema.pre('save',function(next){
  if(this.isNew)
    this.meta.createTime=this.meta.updateTime=Date.now();
  else
    this.meta.updateTime=Date.now();
  next();
});

module.exports=mongoose.model('users',userSchema);
