const Koa=require("koa");
const path=require('path');
const static = require('koa-static');
const Router=require("koa-router");
const KoaBody = require('koa-body');

const app=new Koa();
const router=new Router();

const mongoose =require("mongoose");
// mongoose.connect('mongodb://mongoadmin:123456@192.168.99.100:27017/demo?authSource=admin'
//   ,{ useNewUrlParser: true});
mongoose.connect('mongodb://cj:123456@localhost:27017/demo?authSource=admin'
  ,{ useNewUrlParser: true});
mongoose.set('useCreateIndex',true);

// const main=ctx=>{
//   ctx.response.body="Hello world!"
// }
// app.use(main);

// 1. Static Files
app.use(static(path.resolve(__dirname, "./public")));

// 2. Catch Error
const errorHandler=async(ctx,next)=>{
	try{
		await next();
	}catch(err){
		console.log(err);
		ctx.response.type="json";
		ctx.response.body={
			success:0,
			status: err.statusCode || err.status || 500,
			message: err.message
		}
	}
}
app.use(errorHandler);

// 3. Session

// const session=require('koa-session');
// const MongooseStore = require('koa-session-mongoose');
// app.keys = ['some secret key'];
// app.use(session({
// 	key:"SESSIONID",	//default "koa:sess"
// 	// maxAge:600,		// Note: if set this,cookie won't be return.
// 	store: new MongooseStore({
// 		collection:"sessions",
// 		connection:mongoose,
// 		expires:40,
// 		name:"appSession"
// 	})
// },app));

const session=require('koa-session2');
const MongoStore=require('./util/mongoStore');
const mongoStore = new MongoStore({
	collection:"sessions",
	connection:mongoose,
	expireAfterSeconds:30	// mongo TTL expireAfterSeconds ( unit:s )
});
app.keys=['a secret key'];	// if set signed:true,need setting the .keys.
app.use(session({
	key:"SESSIONID",
	signed:true,		// SESSIONID.sig,need to set .keys,作用：给cookie加上一个sha256的签名,防止cookie被篡改
	maxAge:86400000,	// cookie expire after maxAge ms: 1 day = 24h*60m*60s*1000=86400,000ms
	store: mongoStore
}));

// 4. Request Body Parser
app.use(KoaBody());	


// 5. Prefix Handler
const prefixHandler=async (ctx,next)=>{
  let path=ctx.request.path;
  console.log("prefixFilter..."+ctx.request.method+" "+path+","+ctx.request.url);
  if(ctx.session){
  	  console.log("loginUser:");
	  console.log(ctx.session.loginUser);
	  console.log("cookie:");
	  console.log(ctx.request.header.cookie);	//ctx.cookies
	  //header:ctx.set(key,value)
	  //set updator:
	  //console.log("body:");
	  if(ctx.session.loginUser && ctx.request.body){
	  	ctx.request.body.updator=ctx.session.loginUser.username;
	  	//console.log(ctx.request.body);
	  }
	}
  await next();
}
app.use(prefixHandler);

// 6. Privilege Filter

const PrivilegeStore=require('./util/PrivilegeStore');
let privilegeStore=new PrivilegeStore();
const privilegeFilter=async (ctx,next)=>{
	let reqItem={path:ctx.request.path,method:ctx.request.method
		,roles:(ctx.session && ctx.session.loginUser)?ctx.session.loginUser.roles||[]:[]};
	let privileges = await privilegeStore.privileges;
	let matched = privileges.find((item)=>{
		return privilegeStore.verify(item,reqItem);
	});
	console.log("pass priv:"+matched);
    if(matched)
      await next();
    else
      ctx.throw(401);
}
app.use(privilegeFilter);


// 7. Post Handler -- last one
const postHandler=async (ctx,next)=>{
	await next();
	console.log("postFilter...json");
	ctx.response.type="json";
}
app.use(postHandler);


// Route Controller

var catalogueController=require("./controller/catalogueController");
router.get('/catalogues',catalogueController.list);
router.get('/catalogues/:id',catalogueController.get);
router.put('/catalogues/:id',catalogueController.update);
router.post('/catalogues',catalogueController.create);
router.delete('/catalogues/:id',catalogueController.delete);


var articleController=require("./controller/articleController");
router.get('/articles',articleController.list);
router.get('/articles/:id',articleController.get);
router.put('/articles/:id',articleController.update);
router.post('/articles',articleController.create);
router.delete('/articles/:id',articleController.delete);

var userController=require("./controller/userController");
router.post('/login',userController.login);
router.post('/logout',userController.logout);
router.post('/register',userController.register);

app.use(router.routes());
app.use(router.allowedMethods());

// Start Http Server

app.listen(3000,()=>{
  console.log('app started at port 3000...');
});
