const mongoose=require('mongoose');
let catalogueSchema=mongoose.Schema({
    name:{type:String,required:true,unique:true},
    description:{type:String},
    meta:{
      createTime:{type:Date,default:Date.now},
      updateTime:{type:Date,default:Date.now},
      updator:{type:String}
    }
},{versionKey: false});

// Pre and post save() hooks are not executed on update(), findOneAndUpdate()
catalogueSchema.pre('save',function(next){
  console.log('pre save:'+this.isNew);
  if(this.isNew)
    this.meta.createTime=this.meta.updateTime=Date.now();
  else
    this.meta.updateTime=Date.now();
  next();
});

// doesn't work:
catalogueSchema.pre('update',function(next){
  console.log('pre update:'+this.isNew);
  this.meta.updateTime=Date.now();
  next();
})
module.exports=mongoose.model('catalogues',catalogueSchema);
