var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var _data = require('./lib/data');


_data.update('test','newFile',{'fizz':'buzz'}, function(err){
    console.log('this was the error',err);
});


var httpServer = http.createServer(function(req,res){
  unifiedServer(req,res);
});

httpServer.listen(config.httpPort, function(){
    console.log("The server is listenining on port "+config.httpPort+" in "+config.envName+" mode");
});

var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req,res){
    unifiedServer(req,res);
  });


httpsServer.listen(config.httpsPort, function(){
    console.log("The server is listenining on port "+config.httpsPort+" in "+config.envName+" mode");
});


var unifiedServer = function(req,res){

     
   var parsedUrl = url.parse(req.url,true);
   
   var path = parsedUrl.pathname;

   var trimmedPath = path.replace(/^\/+|\/+$/g,'');
   
   var queryStringObject = parsedUrl.query;

   var method = req.method.toLowerCase();

   var headers = req.headers;

   var decoder = new StringDecoder('utf-8');
   var buffer = '';
   req.on('data', function(data){
       buffer += decoder.write(data);
   });
   req.on('end',function(){
       buffer += decoder.end();

       var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
       
       var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
       };

       chosenHandler(data, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number' ? statusCode: 200;

        payload =typeof(payload) == 'object' ? payload: {};

        var payloadString = JSON.stringify(payload);


        res.setHeader('Content-type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

              

       console.log('Returning this response: ',statusCode, payloadString); 
       });

   });
    
};

var handlers = {};

handlers.ping = function(data,callback){
    callback(200);
};

handlers.notFound = function(data,callback){
    callback(404);
};

var router = {
    'ping' : handlers.ping
};