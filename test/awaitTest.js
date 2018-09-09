function sleep(time){
	console.log("sleep func start")						// 1
	setTimeout(()=>{
		console.log("sleep wakeup after "+time+" !")	// 3 [ execute after sleep `${time} ms` ]
	},time);
	console.log("sleep func end")						// 2
}

function promiseFunc(timeout){
	console.log("a1. build promise instance");			// 1

	let inst=new Promise((resolve,reject)=>{					
		console.log("b1. start promise instance func")	// 2
		setTimeout(()=>{						
			console.log("promise wakeup")			
			resolve("promise resolved after "+timeout);	// 5 <pending> -> <resolved>		
		},timeout);	
		console.log("b2. end promise instance func")	// 3
	});

	console.log("a2. return promise instance");				
	return inst;										// 4
}

async function asyncFunc(timeout){
	console.log("async 1->2")
	let msg=await promiseFunc(timeout);	// 1 
	console.log("await result:"+msg);	// 2 [ 1->2 `blocked ${timeout} ms`, get resolved data ]

	console.log("async 3->4")
	sleep(timeout-2000);				// 3 
	return msg;							// 4  [ 3->4 no block,return a promise instance ] 
}

/*
1->2
async 1->2
a1. build promise instance
b1. start promise instance func
b2. end promise instance func
a2. return promise instance
Promise { <pending> }
3->4
promise wakeup
await result:promise resolved after 5000
async 3->4
sleep func start
sleep func end
promise resolved after 5000
*/
async function test1(timeout){
	console.log("test timeout:"+timeout);

	console.log("1->2")
	let result=asyncFunc(timeout);		// 1
	console.log(result);				// 2 [ 1 -> 2 no block,get a promise instance]

	console.log("3->4")
	let msg=await result;				// 3 
	console.log(msg);					// 4 [ 3 -> 4 blocked `${timeout} ms`, get resolved data ]
};

test1(5000);

/*------------------------------------------------------------------------*/

function promiseFunc2(code){
	console.log("a1. build promise instance");			// 1
	let inst=new Promise((resolve,reject)=>{					
		console.log("b1. start promise instance func")	
		if(code==1)							
			resolve(code+" resolve!");			// 2 <pending> -> <fulfilled>	
		else if(code==0)
			reject(code+" reject!");			// 2 <peinding> -> <rejected> 
		else if(code==-1)
			throw new Error(code+" error!");	// 2 exception
		else{									// 2 reject(e) == throw new Error(xxx);
			try {
				throw new Error(`${code} error! [same with code -1 error!]`);
			} catch(e) {
				reject(e);
			}
		}
		console.log("b2. end promise instance func")
	});
	console.log("a2. return promise instance");			// 3				
	return inst;		
}

async function test2(code){
	console.log("test code:"+code);
	try{
		let msg=await promiseFunc2(code);
		console.log("get return: "+msg);
	}catch(e){
		console.log("get error: "+(e.message||e));
	}
}

/*
test code:1
a1. build promise instance
b1. start promise instance func
b2. end promise instance func
a2. return promise instance

test code:0
a1. build promise instance
b1. start promise instance func
b2. end promise instance func
a2. return promise instance

test code:-1
a1. build promise instance
b1. start promise instance func
a2. return promise instance

test code:-2
a1. build promise instance
b1. start promise instance func
b2. end promise instance func
a2. return promise instance

get return: 1 resolve!
get error: 0 reject!
get error: -1 error!
get error: -2 error! [same with code -1 error!]
*/
// test2(1);
// test2(0);
// test2(-1);
// test2(-2);







