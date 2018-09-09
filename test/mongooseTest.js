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


// Operation

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


