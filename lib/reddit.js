'use strict';
var request = require('request');

function Retrieve(url, callback){
  request.get(url, function(err, res){
    var page = JSON.parse(res.body);
    callback(null, page);
  });
};

module.exports = {
  getData: function(redditUrl, sub, callback){
    var url = redditUrl + '/r/' + sub.name + '.json?sort=' + sub.sortBy + '&limit=' + sub.limit;
    console.log('Reddit URL is: ' + url);
    var pagesCount = 1;
    var pages = [];
    
    Retrieve(url, function(err, page){
      var currentPage = page;
      console.log('Retrieved the first page of reddit posts in /r/' + sub.name);
      pages.push(currentPage);
      
      if(sub.paging){
        console.log('Paging is enabled, grabbing a total of ' + sub.pages + ' pages');
        
        while(pagesCount < sub.pages){
          url = url + '&after=' + currentPage.data.after;
          Retrieve(url, function(err, page){
            currentPage = page;
            pages.push( currentPage );
          });
          pagesCount++;
        }
      }
      
      callback(null, pages)
    });
  }
  
};
