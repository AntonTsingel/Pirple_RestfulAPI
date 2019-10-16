var app = require('./../index');
var assert = require('assert');
var http = require('http');
var config = require('./../lib/config');


var api = {};

var helpers = {};
helpers.makeGetRequest = function(path,callback){
    var requestDetails = {
        'protocol' : 'http:',
        'hostname' : 'localhost',
        'port' : config.httpPort,
        'method' : 'GET',
        'path' : path,
        'headers' : {
        'Content-Type' : 'application/json'
        }
        
    };

    var req = http.request(requestDetails,function(res){
        callback(res);
    });
    req.end();
};

api['app.init shold start without throwing'] = function(done) {
    assert.doesNotThrow(function(){
        app.init(function(err){
            done();
        });
    },TypeError)
};

api['/ping shold respond to GET with 200'] = function(done){
    helpers.makeGetRequest('/ping',function(res){
        assert.equal(res.statusCode,200);
        done();
    });
};

api['/api/users shold respond to GET with 400'] = function(done){
    helpers.makeGetRequest('/api/users',function(res){
        assert.equal(res.statusCode,400);
        done();
    });
};

api['A random path shold respond to GET with 404'] = function(done){
    helpers.makeGetRequest('/this/path/shouldnt/exist',function(res){
        assert.equal(res.statusCode,404);
        done();
    });
};


module.exports = api;