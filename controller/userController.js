
let userDao=require('../module/user');

module.exports={
  register:async (ctx,next)=>{
    let user=ctx.request.body;
    let result=await userDao.create({username:user.username,password:user.password,roles:["user"]});
    console.log(result);
    if(result._id)
      ctx.response.body={
        success:1,
        data:{username:result.username}
      }
  },
  login:async (ctx,next)=>{
    let user=ctx.request.body;
    console.log("login request body:");
    console.log(user);
    let result=await userDao.findOne({username:user.username,password:user.password});
    console.log(result);
    if(result && result.username){
      ctx.session=ctx.session||{};
      ctx.session.loginUser={username:result.username,roles:result.roles};
      ctx.response.body={
        success:1,
        data:ctx.session.loginUser
      }
    }else{
      ctx.response.body={
        success:0,
        message:"login fail"
      }
    }
  },
  logout:async (ctx,next)=>{
    console.log("logout");
    if(ctx.session && ctx.session.loginUser){
      console.log("get loginUser logout");
      delete ctx.session.loginUser;
      ctx.response.body={success:1}
    }else
      ctx.response.body={success:0}
  }
}