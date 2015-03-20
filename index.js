'use strict';


var winston = require('winston');
var _       = require('lodash');
var async   = require('async');
var path    = require('path');
var config  = require('./config');
var Reddit  = require('./lib/reddit');
var Imgur   = require('./lib/imgur');
var Scraper = require('./lib/scraper');

var log = new winston.Logger({
  transports: [new winston.transports.Console(config.log)]
});

Reddit.getData(config.reddit, function(err, data){
  
  if (err) throw err;
  var children = data.data.children;
  
  async.filter(children, function(child, callback){
    
    /**
     * strip out nsfw posts if nsfw isn't enabled
     **/
    if(!config.reddit.nsfw && child.data.over_18 === true){
     // log.debug(child.data.url + ' is tagged as NSFW, removing');
      callback(false);
    /**
     * strip out any non allowed domains
     * imgur.com, i.imgur.com are the only two so far.
     **/
    }else if( !_.includes(config.domains, child.data.domain, 0) ){
      callback(false);
    }else{
      callback(true);
    }
  },function(results){
    
    async.eachLimit(results, config.concurrents, function(child, callback){
      
      var imgPath = path.join(__dirname, config.imgStore);
      if(config.storeByUser){
        imgPath = imgPath + '/' + child.data.author;  
      }
      
      var hash = child.data.url.match(new RegExp("^https?:\/\/(www.)?imgur.com\/(?!gallery|a\/)([a-zA-Z0-9]+)"));
      var album = child.data.url.match(new RegExp("^https?:\/\/(www.)?imgur.com\/a\/([a-zA-Z0-9]+)"));
      
      if( hash ){
        Imgur.getData('hash', hash[2], config.imgur, function(err, image){
          
          var url = image.image.links.original;
          Scraper.download(url, imgPath, function(err, file){
            if(err){
              // log.error(err);
              callback();   
            }else{
              console.log('File Downloaded To: ', file);
              callback();    
            }
          });
          
        });
        
      }else if( album ){
        // log.debug('Getting images from album', album[2]);
        Imgur.getData('album', album[2], config.imgur, function(err, images){
          
          var images = images.album.images;
          var urls = [];
          
          for (var i = 0; i < images.length; i++) {
            urls.push(images[i].links.original);
          }
          
          async.eachLimit(urls, config.concurrents, function(url, callback){
            Scraper.download(url, imgPath, function(err, file){
              if(err){
                // log.error(err);
                callback();   
              }else{
                console.log('File Downloaded To: ', file);
                callback();    
              }
            });
              
          });
          
        });
        
      }else{
        // log.debug('Getting image from url', child.data.url);
        Scraper.download(child.data.url, imgPath, function(err, file){
          if(err){
            // log.error(err);
            callback();   
          }else{
            console.log('File Downloaded To: ', file);
            callback();    
          }
        });
        callback();
      }
    
    }, function(err){
      
    });
  });
  
});