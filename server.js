var fs = require('fs');
var path = require('path');
var http = require('http');
var request = require('request');
var cheerio = require('cheerio');
var urlObj = require('url');
var mime = require('mime');

var url = "http://www.tooopen.com/img/87.aspx";
request(url,function(error,response,body){
	if(!error && response.statusCode == 200){
		//console.log(body);
		getContent(body)
		http.createServer(function(req,res){
			var url = urlObj.parse(req.url,true);
			console.log(url);
			if(url.pathname == '/'){
				fs.readFile('./index.html','utf-8',function(err,data){
					res.setHeader('Content-Type','text/html;charset=utf-8');
					res.end(data);
				})
			}
			else if(url.pathname == '/api/imgData'){
				res.writeHead(200, {'Content-Type': 'text/plain'});
				fs.readdir('./img',function(err,data){
					var imgdata = JSON.stringify(data);
					res.end(imgdata);
				});
			}
			else{
				fs.exists('.'+url.pathname,function(exists){
					if(exists){
						//文件类型多种多样所以要写响应头 告诉浏览器发他起的响应是什么格式的 才能读
						res.setHeader('Content-type',mime.lookup(url.pathname));
						fs.readFile('.'+url.pathname,function(err,data){
							res.end(data);
						});
					}else{
						res.statusCode=404;
						res.end('404');
					}
				})
			}
		}).listen(8002);
	}else{
		console.error('over')
	}
});




function getContent(data){
	var $ = cheerio.load(data);
	var img = $('.pic img').toArray();
	//console.log(img);
	var imgUrl = [];
	img.forEach(function(item){
		var img = {
			name : path.basename(item.attribs.src),
			url : item.attribs.src
		};
		downloadFs(img.url,img.name,function(){
			console.log(img.name+'over');
		})

	});
	//console.log(imgUrl)
}

function downloadFs(src,filename,callbacks){
	request.head(src,function(err,res,body){
		if(err){
			console.error(err);
			return false;
		}
		request(src).pipe(fs.createWriteStream('img/'+filename))
			.on('close',callbacks);
	})
}