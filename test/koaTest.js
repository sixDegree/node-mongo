const Koa=require("koa");
const app=new Koa();

const errorHandler=async(ctx,next)=>{
	try{
		await next();
	}catch(e){
		console.log("catch exception");
		ctx.response.type="json";
		ctx.response.body={
			success:0,
			status: e.statusCode || e.status || 500,
			message: e.message
		}
	}
}

const prefixHandler=async(ctx,next)=>{
	console.log("prefix Handler..."+ctx.request.path);
	if(ctx.request.path=='/error')
		ctx.throw("go to error!");
	await next();
}

const postHandler=async(ctx,next)=>{
	await next();
	console.log("post Handler..."+ctx.request.path);
	ctx.response.type="json";
	ctx.set("micro-test",true);		// set header
}

const fs = require('fs');
const main=async(ctx,next)=>{
	console.log("main")
	let data = await fs.readFileSync('./public/1.txt','utf8');
	console.log("readed:"+data);
	ctx.response.body={
		success:1,
		data:data
	}
}

app.use(errorHandler);
app.use(prefixHandler);
app.use(postHandler);
app.use(main);

app.listen(3000,()=>{
  console.log('app started at port 3000...');
});

/*

1. test success:

> curl -i http://localhost:3000/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
micro-test: true
Content-Length: 35
Date: Sun, 09 Sep 2018 16:07:48 GMT
Connection: keep-alive

{"success":1,"data":"Static File!"}

* server console:
prefix Handler.../1
main
readed:Static File!
post Handler.../1

2. test error

> curl -i http://localhost:3000/error
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 51
Date: Sun, 09 Sep 2018 16:09:19 GMT
Connection: keep-alive

{"success":0,"status":500,"message":"go to error!"}

* server console:
prefix Handler.../error
catch exception

*/