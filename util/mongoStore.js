const mongoose = require('mongoose');
const { Store } = require("koa-session2");

class MongoStore extends Store {
  constructor({connection=mongoose,collection='sessions',expireAfterSeconds=86400000}={}){
    super();
    let storeSchema=new connection.Schema({
      _id:String,
      data:Object,
      updatedAt: {
        default: new Date(),
        expires: expireAfterSeconds, // 1 day: 86400 s = 60s*60m*24h => expireAfterSeconds
        type: Date
      }
    })
    this.modelDao=connection.model(collection,storeSchema);
  }

  async get(sid,ctx){
    console.log("get mongo session:"+sid);
    let result= await this.modelDao.findOne({_id:sid});
    console.log(result);
    return result?result.data:null;
  }

  async set(session, { sid =  this.getID(24), maxAge = 86400000 } = {}, ctx) {
    console.log("set mongo session:"+sid+",cookie maxAge:"+maxAge);
      try {
          let record={_id:sid,data:session,updatedAt:new Date()};
          console.log(record);
          await this.modelDao.updateOne({_id:sid}, record, { upsert: true, safe: true });
      } catch (e) {
        console.log("set mongo session fail:");
        console.log(e);
      }
      return sid;
  }

  async destroy(sid){
    console.log("destroy mongo session:"+sid);
    return await this.modelDao.deleteOne({_id:sid});
  }

}

module.exports = MongoStore;