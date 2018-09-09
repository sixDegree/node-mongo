
let articleDao=require('../module/article');

module.exports={
  list:async (ctx,next)=>{
    console.log(ctx.query);
    let articleList= await articleDao.find(ctx.query,{meta:0,catalogueId:0});
    ctx.response.body={
      success:1,
      data:articleList
    };
  },
  get:async (ctx,next)=>{
    let id=ctx.params.id;
    let article=await articleDao.findOne({_id:id});
    ctx.response.body={
      success:1,
      data:article
    }
  },
  update:async (ctx,next)=>{
    let id=ctx.params.id;
    let article=ctx.request.body;
    let result=await articleDao.updateOne({_id:id}
      ,{$set:{name:article.name,description:article.description,"meta.updateTime":new Date()}},{new:true});
    console.log(result);
    ctx.response.body=result;
  },
  create:async (ctx,next)=>{
    let article=ctx.request.body;
    let result=await articleDao.create(article);
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
    let result=await articleDao.deleteOne({_id:id});
    console.log(result);
    ctx.response.body={
      success:result.ok
    };
  }
}
