const UrlPattern = require('url-pattern');

// ctx.request.path: /catalogues/1
// ctx.request.url: /catalogues/1?x=1
let pattern=new UrlPattern('/catalogues/:id');
console.log(pattern.match('/catalogues'));			//null
console.log(pattern.match('/catalogues/1'));		//{id:'1'}
console.log(pattern.match('/catalogues/1/2'));		//null
console.log(pattern.match('/catalogues/1?x=3'));	//null
console.log(pattern.match('catalogues'));			//null
