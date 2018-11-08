
## Prepare MongoDB (Docker)

### install mongodb 

```sh
# Server (mongod)
mkdir mongo
cd mongo
mkdir -p data data/db

# MONGO_INITDB_ROOT_USERNAME & MONGO_INITDB_ROOT_PASSWORD create a new user for authentication database: admin,give role: root
# then the mongodb will start with authentication enabled : mongod --auth
docker run --name micro-mongo -p 27017:27017 -v `pwd`/data/db:/data/db -e MONGO_INITDB_ROOT_USERNAME=cj -e MONGO_INITDB_ROOT_PASSWORD=123456 -d mongo:latest

# re-enter server container:
docker exec -it micro-mongo /bin/bash

mongo -u cj -p 123456 --authenticationDatabase admin
```

### mongodb client

```sh
# Client (mongo)
# admin: authentication database; demo: the dabatase after login; if not set,use default db:test
docker run -it --rm --link micro-mongo:mongod --name mongo-client mongo:latest mongo -host mongod -u cj -p 123456 --authenticationDatabase admin demo
```

### mongodb cmd

```sh
show dbs
db
show collections
```

## Prepare Test Data

### 1. Model: catalogues

name,description,meta:createTime,updateTime,updator

```vim
> db.catalogues.insert([
{name:"Spring",description:"spring framework",meta:{createTime:new Date(),updateTime:new Date(),updator:"Tom"}},
{name:"ReactJS",description:"reactJS front framework",meta:{createTime:new Date(),updateTime:new Date(),updator:"Tom"}},
{name:"NoSql",description:"not only sql databases",meta:{createTime:new Date(),updateTime:new Date(),updator:"Tom"}}
]);
```

### 2. Model: articles

title,author,description,tags,catalogue,postDate,content,meta:createTime,updateTime

```vim
> db.articles.insert([
{title:"Spring Basic",author:"Tom",description:"introduce spring basic",tags:["java","spring"],catalogueId:db.catalogues.findOne({name:"Spring"})._id,postDate:"2015-01-01",content:"spring basic:ioc,aop",meta:{createTime:new Date(),updateTime:new Date()}},
{title:"Spring MVC",author:"Tom",description:"introduce spring mvc",tags:["java","spring","mvc"],catalogueId:db.catalogues.findOne({name:"Spring"})._id,postDate:"2015-01-11",content:"spring mvc:dispatchServlet,restful",meta:{createTime:new Date(),updateTime:new Date()}},
{title:"Spring Security",author:"Tom",description:"introduce spring security",tags:["java","spring","security"],catalogueId:db.catalogues.findOne({name:"Spring"})._id,postDate:"2015-01-21",content:"spring security:securityFilter,authentication,accessDecide",meta:{createTime:new Date(),updateTime:new Date()}},
{title:"ReactJS Basic",author:"Lucy",description:"introduce reactJS front framework basic",tags:["front","reateJS"],catalogueId:db.catalogues.findOne({name:"ReactJS"})._id,postDate:"2015-02-01",content:"reactJS basic:component,lifecycle,props,state",meta:{createTime:new Date(),updateTime:new Date()}},
{title:"ReactJS Flux",author:"Lucy",description:"introduce reactJS Flux",tags:["front","reateJS"],catalogueId:db.catalogues.findOne({name:"ReactJS"})._id,postDate:"2015-02-11",content:"reactJS Flux:reflux,redux",meta:{createTime:new Date(),updateTime:new Date()}},
{title:"Redis",author:"Jack",description:"introduce redis key-value db",tags:["nosql","redis"],catalogueId:db.catalogues.findOne({name:"NoSql"})._id,postDate:"2015-03-11",content:"redis:install,master-slave,persist,subscribe,crud",meta:{createTime:new Date(),updateTime:new Date()}},
{title:"MongoDB",author:"Jack",description:"introduce mongo document database",tags:["nosql","mongodb"],catalogueId:db.catalogues.findOne({name:"NoSql"})._id,postDate:"2015-03-21",content:"mongodb:mongo shell,crud,index,aggregation,replica,sharding",meta:{createTime:new Date(),updateTime:new Date()}}
]);
```

check catalogues and articles:

```vim
> db.catalogues.aggregate([ 
	{$project:{id:1,name:1}},
	{ $lookup:{ from:"articles", localField:"_id", foreignField:"catalogueId" ,as:"articles"} },
	{$project:{"_id":0,"name":1,"articles.title":1}} 
])
{ "name" : "Spring", "articles" : [ { "title" : "Spring Basic" }, { "title" : "Spring MVC" }, { "title" : "Spring Security" } ] }
{ "name" : "ReactJS", "articles" : [ { "title" : "ReactJS Basic" }, { "title" : "ReactJS Flux" } ] }
{ "name" : "NoSql", "articles" : [ { "title" : "Redis" }, { "title" : "MongoDB" } ] }
```

### 3. Model: users

username,password,roles,meta:createTime,updateTime

```vim
> db.users.insert([
{username:"Tom",password:"123",roles:["user"],meta:{createTime:new Date(),updateTime:new Date()}},
{username:"kk",password:"123",roles:["admin"],meta:{createTime:new Date(),updateTime:new Date()}},
{username:"admin",password:"123",roles:["user","admin"],meta:{createTime:new Date(),updateTime:new Date()}}
]);
```

### 4. Model: privileges

path,method,roles

```vim
> db.privileges.insert([
{path:"/catalogues",method:"GET",roles:[]},
{path:"/catalogues/:id",method:"GET"},
{path:"/catalogues/:id",method:"PUT",roles:["admin"]},
{path:"/catalogues/:id",method:"DELETE",roles:["admin"]},
{path:"/catalogues",method:"POST",roles:["admin"]},
{path:"/articles",method:"GET"},
{path:"/articles/:id",method:"GET"},
{path:"/articles/:id",method:"PUT",roles:["user"]},
{path:"/articles/:id",method:"DELETE",roles:["user","admin"]},
{path:"/articles",method:"POST",roles:["user"]},
{path:"/login",method:"POST"},
{path:"/register",method:"POST"},
{path:"/logout",method:"POST"},
]);
```

## Start Demo

Start MongoDB Server Container:

```sh
docker ps
docker start micro-mongo
```

Start HttpServer:

```sh
cd node-mongo
npm install
node app
```

Visit: `http://localhost:3000`

eg:

1. list catalogues - `GET /catalogues`

```sh
> curl -i http://localhost:3000/catalogues

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 287
Date: Tue, 11 Sep 2018 15:33:52 GMT
Connection: keep-alive

{"success":1,"data":[{"_id":"5b8e87236d51124b97751d32","name":"Spring","description":"spring framework"},{"_id":"5b8e87236d51124b97751d33","name":"ReactJS","description":"reactJS front framework"},{"_id":"5b8e87236d51124b97751d34","name":"NoSql","description":"not only sql databases"}]}
```

2. get catalogue details by id - `GET /catalogues/:id`

```sh
> curl -i http://localhost:3000/catalogues/5b8e87236d51124b97751d32

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 209
Date: Tue, 11 Sep 2018 15:35:01 GMT
Connection: keep-alive

{"success":1,"data":{"meta":{"createTime":"2018-09-04T13:22:43.204Z","updateTime":"2018-09-04T13:22:43.204Z","updator":"Tom"},"_id":"5b8e87236d51124b97751d32","name":"Spring","description":"spring framework"}
```

3. create catalogue - `POST /catalogue` (need login & has admin role)

```sh
> curl -i -H "Content-Type:application/json" -X POST --data '{"name":"Docker","description":"Build, Ship, and Run Any App, Anywhere"}' http://localhost:3000/catalogues

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 48
Date: Tue, 11 Sep 2018 15:43:32 GMT
Connection: keep-alive

{"success":0,"status":401,"message":"Unauthorized"}

# after login
> curl -i -b cookie.txt -H "Content-Type:application/json" -X POST --data '{"name":"Docker","description":"Build, Ship, and Run Any App, Anywhere"}' http://localhost:3000/catalogues

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 215
Date: Tue, 11 Sep 2018 16:37:43 GMT
Connection: keep-alive

{"success":1,"data":{"meta":{"createTime":"2018-09-11T16:37:42.991Z","updateTime":"2018-09-11T16:37:42.991Z"},"_id":"5b97ef56f0a7fe0ab7f422f8","name":"Docker","description":"Build, Ship, and Run Any App, Anywhere"}}

```

4. update catalogue by id - `PUT /catalogues/:id` (need login & has admin role)

```sh
# after login
> curl -i -b cookie.txt -H "Content-Type:application/json" -X PUT --data '{"name":"Docker Feature","description":"Container:Build, Ship, and Run Any App, Anywhere"}' http://localhost:3000/catalogues/5b97ef56f0a7fe0ab7f422f8

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 28
Date: Tue, 11 Sep 2018 16:39:56 GMT
Connection: keep-alive

{"n":1,"nModified":1,"ok":1}

```

5. delete catalogue by id - `DELETE /catalogues/:id` (need login & has admin role)

```sh
# after login
> curl -i -b cookie.txt -X DELETE http://localhost:3000/catalogues/5b97ef56f0a7fe0ab7f422f8

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 13
Date: Tue, 11 Sep 2018 16:41:08 GMT
Connection: keep-alive

{"success":1}
```

6. user register - `POST /register` (gust access,register user will be assigned role:user)

```sh
> curl -i -d "username=lucy&password=123" http://localhost:3000/register

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 40
Date: Tue, 11 Sep 2018 16:52:17 GMT
Connection: keep-alive

{"success":1,"data":{"username":"lucy"}}

# logined user,register fail
> curl -i -d "username=lucy&password=123" http://localhost:3000/register

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 40
Date: Tue, 11 Sep 2018 16:52:17 GMT
Connection: keep-alive

{"success": 0,"status": 500,"message": "logout first!"}

```

6. user login - `POST /login`

```sh
# curl -i -H "Content-Type:application/json" -X POST --data '{"username":"admin","password":"123"}' http://localhost:3000/login
# curl -i -d "username=admin&password=123" http://localhost:3000/login
> curl -i -c cookie.txt -d "username=admin&password=123" http://localhost:3000/login

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Set-Cookie: SESSIONID=8cbe57db55bb6c944df99ec9a10481a431c41e5ba1400a4a; path=/; expires=Wed, 12 Sep 2018 16:29:57 GMT; httponly
Set-Cookie: SESSIONID.sig=TsESPv34Ny1rOA9jimTrlybpHDE; path=/; expires=Wed, 12 Sep 2018 16:29:57 GMT; httponly
Content-Length: 59
Date: Tue, 11 Sep 2018 16:29:57 GMT
Connection: keep-alive

{"success":1,"data":{"username":"admin","roles":["admin"]}}

# re-login
> curl -c cookie.txt -d "username=admin&password=123" http://localhost:3000/login

{"success": 0,"status": 500,"message": "already logined!"}

> cat cookie.txt
# Netscape HTTP Cookie File
# http://curl.haxx.se/docs/http-cookies.html
# This file was generated by libcurl! Edit at your own risk.

#HttpOnly_localhost FALSE / FALSE 1536769797  SESSIONID 8cbe57db55bb6c944df99ec9a10481a431c41e5ba1400a4a
#HttpOnly_localhost FALSE / FALSE 1536769797  SESSIONID.sig TsESPv34Ny1rOA9jimTrlybpHDE
```

mongodb stored session:

```sh
> db.sessions.find().pretty()
{
  "_id" : "8cbe57db55bb6c944df99ec9a10481a431c41e5ba1400a4a",
  "__v" : 0,
  "data" : {
    "loginUser" : {
      "username" : "admin",
      "roles" : [
        "admin"
      ]
    }
  },
  "updatedAt" : ISODate("2018-09-11T16:29:57.025Z")
}
```

7. user logout - `POST /logout`

```sh
> curl -i -X POST http://localhost/logout

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 13
Date: Tue, 11 Sep 2018 16:00:16 GMT
Connection: keep-alive

{"success":0}

> cat cookie.txt

> curl -i -b cookie.txt -X POST http://localhost:3000/logout

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Set-Cookie: SESSIONID=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly
Content-Length: 13
Date: Tue, 11 Sep 2018 16:00:55 GMT
Connection: keep-alive

{"success":1}

```

## Koa


### app

```js
const Koa=require("koa");
const app=new Koa();

const main=ctx=>{
   ctx.response.type="json";
   ctx.response.body={
   	success:1,
   	msg:"Hello world!"
   }
}
app.use(main);

app.listen(3000,()=>{
  console.log('app started at port 3000...');
});
```

### static

```js
const static = require('koa-static');
app.use(static(path.resolve(__dirname, "./public")));
```

### body

```js
const KoaBody = require('koa-body');
app.use(KoaBody());	
app.use(async(ctx,next)=>{
	console.log("request body:");
	console.log(ctx.request.body);
	await next();
});
```

### router

`npm install koa-router -s`


```js
const Router=require("koa-router");
const router=new Router();

var catalogueController=require("./controller/catalogueController");
router.get('/catalogues',catalogueController.list);
router.get('/catalogues/:id',catalogueController.get);
router.put('/catalogues/:id',catalogueController.update);
router.post('/catalogues',catalogueController.create);
router.delete('/catalogues/:id',catalogueController.delete);

app.use(router.routes());
app.use(router.allowedMethods());
```

```js
// catalogueController.js
module.exports={
  list:async (ctx,next)=>{
  	...
  },
  get:async (ctx,next)=>{
  	...
  },
  ...
}
```

### session

`npm install koa-session2 -s`

extend: store session on mongodb

app.js

```js
const session=require('koa-session2');
const MongoStore=require('./util/mongoStore');

const mongoose =require("mongoose");
mongoose.connect('mongodb://cj:123456@localhost:27017/demo?authSource=admin'
  ,{ useNewUrlParser: true});
mongoose.set('useCreateIndex',true);

app.keys=['a secret key'];	// if set signed:true,need setting the .keys.
app.use(session({
	key:"SESSIONID",
	//signed:true,		// SESSIONID.sig,need to set .keys,作用：给cookie加上一个sha256的签名,防止cookie被篡改
	maxAge:86400000,	// cookie expire after maxAge ms: 1 day = 24h*60m*60s*1000=86400,000ms
	store: new MongoStore({
		collection:"sessions",
		connection:mongoose,
		expireAfterSeconds:30	// mongo TTL expireAfterSeconds ( unit:s )
	})
}));

...

app.use(async(ctx,next)=>{
	// set: ctx.session.Xxx=xxx
	// remove: delete ctx.session.Xxx
	...
})

```

mongoStore.js

```js
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
```

session stored in mongodb:

```sh
> db.sessions.find().pretty()
{
    "_id" : "53094f8db3e399e17616a4d910676c58b6cde92f3b9435be",
    "__v" : 0,
    "data" : {
        "loginUser" : {
            "username" : "admin",
            "roles" : [
                "admin"
            ]
        }
    },
    "updatedAt" : ISODate("2018-09-09T09:40:40.277Z")
}
```

```sh
> db.sessions.getIndexes()
[
  {
    "v" : 2,
    "key" : {
      "_id" : 1
    },
    "name" : "_id_",
    "ns" : "demo.sessions"
  },
  {
    "v" : 2,
    "key" : {
      "updatedAt" : 1
    },
    "name" : "updatedAt_1",
    "ns" : "demo.sessions",
    "expireAfterSeconds" : 30,
    "background" : true
  }
]
```


## mongoose

`npm install mongoose -s`


```js
const mongoose =require("mongoose");
mongoose.connect('mongodb://cj:123456@localhost:27017/demo?authSource=admin'
  ,{ useNewUrlParser: true});
mongoose.set('useCreateIndex',true);

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

let catalogueDao=mongoose.model('catalogues',catalogueSchema);
```

```js
// Operate Functions

async function list(){
    let catalogueList= await catalogueDao.find({},{meta:0});
    return catalogueList;
};

async function get(id){
	let catalogue=await catalogueDao.findOne({_id:id});
	return catalogue;
}

async function create(catalogue){
	let result=await catalogueDao.create(catalogue);
	console.log("create:");
	console.log(result);
	return result;
}

async function udpateCatalogue(id,catalogue){
  let result=await catalogueDao.updateOne({_id:id}
    ,{$set:{name:catalogue.name,description:catalogue.description
      ,"meta.updateTime":new Date(),"meta.updator":catalogue.updator}},{new:true});
	return result;
}

async function deleteCatalogue(id){
	let result=await catalogueDao.deleteOne({_id:id});
	return result;
}
```

```js
// test
async function test(){
  console.log("start test");

  let catalogue={name:"Docker",description:"Build, Ship, and Run Any App, Anywhere"};
  let newCatalogue= await create(catalogue);
  let id=newCatalogue._id;

  console.log("list:")
  let catalogueList=await list();
  console.log(catalogueList);

  console.log(`update ${id}:`);
  let catalogueChange={name:"Docker Feature",
    description:"Container:Build, Ship, and Run Any App, Anywhere",
    updator:"anomy"
  };
  let result=await udpateCatalogue(id,catalogueChange);
  console.log(result);

  console.log(`get ${id}:`)
  result=await get(id);
  console.log(result);

  console.log(`delete ${id}:`)
  result=await deleteCatalogue(newCatalogue._id);
  console.log(result);

  console.log("end test");
  mongoose.disconnect();
  console.log("finish!");
}

// clear same records in mongodb first
// db.catalogues.remove({name:{$regex:"Docker*"}})
test();
```


