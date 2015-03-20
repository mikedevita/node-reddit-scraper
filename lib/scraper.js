'use strict';
var request = require('request');
var fs      = require('fs');
var mkdirp  = require('mkdirp');

module.exports = {
  download: function download(url, path, callback){
    var fileName = url.substr(url.lastIndexOf('/') + 1);
    
    mkdirp(path, function(err){
      if(err) throw err;
      
      fs.exists(path + '/' + fileName, function(exists){
        if(!exists){
          request.get(url).pipe(fs.createWriteStream(path + '/' + fileName));
          callback(null, path + '/' + fileName);      
        }else{
          callback("File Exists, Not Redownloaded");
        }
      });
    });
    
  }
  
};
