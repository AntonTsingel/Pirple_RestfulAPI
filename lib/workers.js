var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var _data = require('./data');
var helpers = require('./helpers');
var path = require('path');


var workers = {};


workers.gatherAllChecks = function(){
    _data.list('checks',function(err,checks){
        if(!err && checks && checks.length > 0){
            checks.forEach(function(check){
                _data.read('checks',check,function(err,originalCheckData){
                    if(!err && originalCheckData){
                        workers.validateCheckData(originalCheckData);
                    } else {
                        console.log("Error reading one of the checks data");
                    }
                });
            });
        } else {
            console.log("Error: Could not find any checks to process");
        }
    });
};


workers.validateCheckData = function(originalCheckData){
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    originalCheckData.state = originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';


};




workers.loop = function(){
    setInterval(function(){
        workers.gatherAllChecks();
    },1000 * 60)

};

workers.init = function() {
    worker.gatherAllChecks();

    workers.loop();
};


module.exports = workers;