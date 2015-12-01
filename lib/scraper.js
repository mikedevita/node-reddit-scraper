var request  = require('request');
var fs       = require('fs');
var mkdirp   = require('mkdirp');
var _        = require('lodash');
var async    = require('async');
var path     = require('path');
var sanitize = require('sanitize-filename');
var config   = require('../config');
var Imgur    = require('./imgur');
var Gfycat   = require('./gfycat');
var Log      = require('./logger');


/** Array of image URLs **/
var Images = [];
function _download(url, path, callback){
  var fileName = url.substr(url.lastIndexOf('/') + 1);
  var sanitizedFileName = sanitize(fileName);

  mkdirp(path, function (err) {
    if (err) {
      throw err;
    }

    fs.exists(path + '/' + sanitizedFileName, function (exists) {
      if (!exists) {
        request.get(url).pipe( fs.createWriteStream(path + '/' + sanitizedFileName) ).on('close', function () {
          return callback(null, path + '/' + sanitizedFileName);
        });
      } else {
        callback('File ' + path + '/' + sanitizedFileName + ' exists, not re-downloaded');
      }
    });
  });
}

function scrape(sub, page, options, callback){
  var children = page.data.children;
  Log.debug('Scraper::scrape() - ' + children.length + ' total posts received');
  // Log.debug('Index - allowed domains are: ' + options.domains);
  var results = children.filter(function (child){
    /**
     * strip out nsfw posts if nsfw isn't enabled
     **/
    if (!sub.nsfw && child.data.over_18 === true){
      Log.debug(child.data.url + ' is tagged as NSFW, removing');
      return false;
    }

    /**
     * strip out any non allowed domains
     **/
    if ( !_.includes(options.domains, child.data.domain, 0) ){
      // Log.debug('Scraper::scrape() - domain not in allowed list ' + child.data.domain);
      return false;
    }
    return true;
  });
  Log.debug('Scraper::scrape() - ' + results.length + ' total posts on this page viable for scraping.');

  // iterate over reddit posts (results)
  async.eachLimit(results, config.concurrents, function (child, callback) {

    var imgPath = path.join(sub.imgStore);
    if (sub.storeByUser) {
      imgPath = imgPath + '/' + child.data.author;
    }

    if ( config.imgur.enabled && _.includes(config.imgur.domains, child.data.domain, 0) ) {
      Imgur.getData(child.data.url, { imgPath: imgPath }, function (err, images) {
        if (err) {
          Log.error(err);
          return callback(err);
        }
        Images.push(images);
        callback();
      });
    } else if ( config.gfycat.enabled && _.includes(config.gfycat.domains, child.data.domain, 0)  ) {
      Gfycat.getData(child.data.url, { imgPath: imgPath }, function (err, images) {
        if (err) {
          Log.error(err);
          return callback(err);
        }
        Images.push(images);
        callback();
      });
    }


  // when all posts have been iterated
  }, function (err) {

    if (err) {
      Log.error(err);
      return callback(err);
    }
    Log.debug('Scraper::scrape() - ' + _.flatten(Images).length + ' total images ready for download');
    async.eachLimit(_.flatten(Images), config.concurrents, function (image, callback) {
      _download(image.url, image.imgPath, function (err, file) {
        if (err) {
          Log.warn('Scraper::download() - ' + err);
          return callback();
        }
        Log.debug('Scraper::download() - File downloaded to ' + file);
        callback();
      });
    });

    Log.info('Finished with /r/' + sub.name);
    callback();
  });
}

module.exports = {
  scrape: scrape
};
