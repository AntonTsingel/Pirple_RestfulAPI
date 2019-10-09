
var crypto = require('crypto');
var config = require('./config');

var helpers = {};
helpers.hash = function(str){
    if(typeof(str) == 'string' && str.length > 0){
        
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};


helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj;
    }catch(e){
        return {};
    } 
};

helpers.createRandomString = function(strLenght){
    strLenght = typeof(strLenght) == 'number' && strLenght > 0 ? strLenght : false;
    if(strLenght){
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789' + 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();

        var str = '';
        for(i = 1; i <= strLenght; i++){
            var randomCharater = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length)); 

            str+=randomCharater;
        }
        return str;
    } else {
        return false;
    }
};

module.exports = helpers;