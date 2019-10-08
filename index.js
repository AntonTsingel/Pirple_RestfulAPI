var http = require('http');
var url = require('url');

var server = http.createServer(function(req,res){
   
   var parsedUrl = url.parse(req.url,true);
   
   var path = parsedUrl.pathname;
   var trimmedPath = path.replace(/^\/+|\/+$/g,'')
   
   var queryStringObject = parsedUrl.query;

   var method = req.method.toLowerCase();
    
    res.end('Hello world\n');

    console.log('Request received on path: '+trimmedPath+ ' with this method: '+ method+ ' and with these query parameters: ',queryStringObject);
});

server.listen(3000, function(){
    console.log("The server is listenining on port 3000 now");
});