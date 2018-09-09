
let catalogueDao=require('../module/catalogue');

module.exports={
  list:async (ctx,next)=>{
    let catalogueList= await catalogueDao.find({},{meta:0});
    ctx.response.body={
      success:1,
      data:catalogueList
    };
  },
  get:async (ctx,next)=>{
    let id=ctx.params.id;
    let catalogue=await catalogueDao.findOne({_id:id});
    ctx.response.body={
      success:1,
      data:catalogue
    }
  },
  update:async (ctx,next)=>{
    let id=ctx.params.id;
    let catalogue=ctx.request.body;
    console.log("catalogue updator:"+catalogue.updator);
    let result=await catalogueDao.updateOne({_id:id}
      ,{$set:{name:catalogue.name,description:catalogue.description
        ,"meta.updateTime":new Date(),"meta.updator":catalogue.updator}},{new:true});
    console.log(result);
    ctx.response.body=result;
  },
  create:async (ctx,next)=>{
    let catalogue=ctx.request.body;
    let result=await catalogueDao.create(catalogue);
    if(result._id)
      ctx.response.body={
        success:1,
        data:result
      };
    else
      ctx.response.body={
        success:0,
        data:result
      }
  },
  delete:async (ctx,next)=>{
    let id=ctx.params.id;
    let result=await catalogueDao.deleteOne({_id:id});
    console.log(result);
    ctx.response.body={
      success:result.ok
    };
  }
}
