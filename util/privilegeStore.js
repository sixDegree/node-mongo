const mongoose = require('mongoose');
const UrlPattern=require('url-pattern');

class PrivilegeStore{

  constructor({connection=mongoose,collection='privileges'}={}){
    let storeSchema=this.initSchema();
    this.privilegeDao=connection.model(collection,storeSchema);
    this.privileges=this.loadPrivileges();
  }

  initSchema(){
    let privilegeSchema=mongoose.Schema({
        path:{type:String,required:true},
        method:{type:String,required:true},
        roles:{type:Array},
        meta:{
          createTime:{type:Date,default:Date.now},
          updateTime:{type:Date,default:Date.now},
          updator:{type:String}
        }
    });
    privilegeSchema.pre('save',function(next){
      if(this.isNew)
        this.meta.createTime=this.meta.updateTime=Date.now();
      else
        this.meta.updateTime=Date.now();
      next();
    });
    return privilegeSchema;
  }

  async loadPrivileges(){
    let result=await this.privilegeDao.find({},{_id:0,meta:0});
    result.map((item,index,arr)=>{
       item.pattern=new UrlPattern(item.path);
       return item;
    });
    console.log(result);
    return result;
  }

  async refresh(){
    this.privileges=this.loadPrivileges();
  }

  verify(item,reqItem){
    // console.log(item);
    if(item.method!=reqItem.method)
      return false;
    let pattern = item.pattern;
    if(!pattern){
      console.log("init pattern");
      pattern=new UrlPattern(item.path);
    }
    let match=pattern.match(reqItem.path);
    if(match==null){
      // console.log("path not match");
      return false;
    }
    if(!item.roles || item.roles.length==0){
      console.log("guest pass");
      return true;
    }
    if(item.roles.find((n)=>reqItem.roles.includes(n))){
      console.log("auth pass");
      return true;
    }
    return false; 
  }

}

module.exports = PrivilegeStore;