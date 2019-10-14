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
var util = require('util');
var debug = util.debuglog('server');

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
server.httpsServer = https.createServer(server.httpsServerOptions, function(req,res){
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
       
        chosenHandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenHandler;

       var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
       };

       chosenHandler(data, function(statusCode, payload,contentType){

        contentType = typeof(contentType) == 'string' ? contentType : 'json';

        statusCode = typeof(statusCode) == 'number' ? statusCode: 200;

       
        var payloadString = '';
        if(contentType == 'json'){
            res.setHeader('Content-type', 'application/json');
            payload =typeof(payload) == 'object' ? payload: {};
            payloadString = JSON.stringify(payload);
        } 
        if(contentType == 'html'){
            res.setHeader('Content-type', 'text/html');
            payloadString = typeof(payload) == 'string' ? payload: '';
        }
        if(contentType == 'favicon'){
            res.setHeader('Content-type', 'image/x-icon');
            payloadString = typeof(payload) !== 'undefined' ? payload: '';
        }
        if(contentType == 'css'){
            res.setHeader('Content-type', 'text/css');
            payloadString = typeof(payload) !== 'undefined' ? payload: '';
        }
        if(contentType == 'png'){
            res.setHeader('Content-type', 'image/png');
            payloadString = typeof(payload) !== 'undefined' ? payload: '';
        }
        if(contentType == 'jpg'){
            res.setHeader('Content-type', 'image/jpeg');
            payloadString = typeof(payload) !== 'undefined' ? payload: '';
        }
        if(contentType == 'plain'){
            res.setHeader('Content-type', 'text/plain');
            payloadString = typeof(payload) !== 'undefined' ? payload: '';
        }
       
        res.writeHead(statusCode);
        res.end(payloadString);

              
        if(statusCode == 200){
            debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
        } else {
            debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
        }
       });

   });
    
};

server.router = {
    '' : handlers.index,
    'account/create' : handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checksList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks,
    'favicon.ico' : handlers.favicon,
    'public' : handlers.public
};

server.init = function(){
    server.httpServer.listen(config.httpPort, function(){
        console.log('\x1b[36m%s\x1b[0m','The server is listenining on port ' +config.httpPort+' in '+config.envName+' mode');
    });
    
    server.httpsServer.listen(config.httpsPort,function(){
        console.log('\x1b[35m%s\x1b[0m','The HTTPS server is running on port '+config.httpsPort);
       });
      
};

module.exports = server;