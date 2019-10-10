var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
//var _data = require('./lib/data');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// _data.delete('test','newFile',function(err){
//     console.log('this was the error',err);
// });


/*
Connecting to the twilio
helpers.sendTwilioSms('4158375309','Hello', function(err){
    console.log('this was the error',err);
});
*/

var server = {};

server.httpServer = http.createServer(function(req,res){
    server.unifiedServer(req,res);
  });

server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname,'/..//https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(httpsServerOptions, function(req,res){
    unifiedServer(req,res);
  });



server.unifiedServer = function(req,res){

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

       var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
       
       var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
       };

       chosenHandler(data, function(statusCode, payload){
        statusCode = typeof(statusCode) == 'number' ? statusCode: 200;

        payload =typeof(payload) == 'object' ? payload: {};

        var payloadString = JSON.stringify(payload);


        res.setHeader('Content-type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);

              

       console.log(trimmedPath,statusCode); 
       });

   });
    
};

server.router = {
    'ping' : handlers.ping,
    'users' : handlers.users,
    'tokens' : handlers.tokens,
    'checks' : handlers.checks
};

server.init = function(){
    server.httpServer.listen(config.httpPort, function(){
        console.log("The server is listenining on port "+config.httpPort+" in "+config.envName+" mode");
    });
    
    server.httpsServer.listen(config.httpsPort,function(){
        console.log('The HTTPS server is running on port '+config.httpsPort);
       });
      
};

module.exports = server;