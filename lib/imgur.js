'use strict';
var request = require('request');


module.exports = {
  getData: function getData(type, hash, options, callback){
      
    var url = options.urls[type] + '/' + hash + '.json';
    
    request.get(url, function(err, res){
      if(err) return callback(err);
      if(res.statusCode !== 200) return callback(err);
      callback(null, JSON.parse(res.body));
    });
  }
  
};
