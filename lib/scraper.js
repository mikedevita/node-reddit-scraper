'use strict';
var request = require('request');
var fs      = require('fs');
var mkdirp  = require('mkdirp');
var _       = require('lodash');
var async   = require('async');
var path    = require('path');
var config  = require('../config');
var Imgur   = require('./imgur');

module.exports = {
  scrape: function(page, callback){
    var children = page.data.children;
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
        
        var imgPath = path.join(config.imgStore);
        if(config.storeByUser){
          imgPath = imgPath + '/' + child.data.author;  
        }
        
        var hash = child.data.url.match(new RegExp("^https?:\/\/(www.)?imgur.com\/(?!gallery|a\/)([a-zA-Z0-9]+)"));
        var album = child.data.url.match(new RegExp("^https?:\/\/(www.)?imgur.com\/a\/([a-zA-Z0-9]+)"));
        
        if( hash ){
          Imgur.getData('hash', hash[2], config.imgur, function(err, image){
            
            var url = image.image.links.original;
            module.exports.download(url, imgPath, function(err, file){
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
              module.exports.download(url, imgPath, function(err, file){
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
          module.exports.download(child.data.url, imgPath, function(err, file){
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
      
      callback(true);
      
      }, function(err){
        
      });
    });
  },
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
