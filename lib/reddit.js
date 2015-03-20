'use strict';
var request = require('request');

function Retrieve(url, callback){
  request.get(url, function(err, res){
    var page = JSON.parse(res.body);
    callback(null, page);
  });
};

module.exports = {
  getData: function getPages(options, callback){
    var url = options.url + '/r/' + options.sub + '.json?sort=' + options.sortBy + '&limit=' + options.limit;
    console.log('Reddit URL is: ' + url);
    var pagesCount = 1;
    var pages = [];
    
    Retrieve(url, function(err, page){
      var currentPage = page;
      console.log('Retrieved the first page of reddit posts in /r/' + options.sub);
      pages.push(currentPage);
      
      if(options.paging){
        console.log('Paging is enabled, grabbing a total of ' + options.pages + ' pages');
        
        while(pagesCount < options.pages){
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
