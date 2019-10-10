var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var _data = require('./data');
var helpers = require('./helpers');
var path = require('path');


var workers = {};


workers.loop = function(){

};

workers.init = function() {
    worker.gatherAllChecks();

    workers.loop();
};


module.exports = workers;