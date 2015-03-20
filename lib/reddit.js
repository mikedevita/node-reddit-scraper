'use strict';
var request = require('request');


module.exports = {
  getData: function getPages(options, callback){
    var url = options.url + '/r/' + options.sub + '.json?sort=' + options.sortBy + '&limit=' + options.limit;
    
    var body = require('../posts.json');
  
    callback( null, body);
    // request.get(url, function(err, res){
    //   if(err) return callback(err);
    //   if(res.statusCode !== 200) return callback(err);
    //   callback(null, JSON.parse(res.body));
    // });
  }
  
};
