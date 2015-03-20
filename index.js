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

Reddit.getData(config.reddit, function(err, pages){
  
  if (err) throw err;
  
  if( Array.isArray(pages) ){
    async.eachLimit(pages, 1, function(page, callback){
      Scraper.scrape(page, callback);
    }, function(err){
      // console.log(err);
    })
  }
  
});

