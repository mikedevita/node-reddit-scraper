var request  = require('request');
var fs       = require('fs');
var mkdirp   = require('mkdirp');
var _        = require('lodash');
var async    = require('async');
var path     = require('path');
var sanitize = require('sanitize-filename');
var config   = require('../config');
var Imgur    = require('./imgur');
var Log      = require('./logger');


/** Array of image URLs **/
var Images = [];
var domains = _.flatten([config.imgur.domains, config.gfycat.domains]);

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

function scrape(sub, page, callback){
  var children = page.data.children;
  Log.debug('Scraper::scrape() - ' + children.length + ' total posts received');
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
     * imgur.com, i.imgur.com are the only two so far.
     **/

    if ( !_.includes(domains, child.data.domain, 0) ){
      Log.debug('Scraper::scrape() - domain not in allowed list ' + child.data.domain);
      return false;
    }
    return true;
  });
  Log.debug('Scraper::scrape() - ' + results.length + ' total posts viable for scraping.');

  // iterate over reddit posts (results)
  async.eachLimit(results, config.concurrents, function (child, callback) {

    var imgPath = path.join(sub.imgStore);
    if (sub.storeByUser) {
      imgPath = imgPath + '/' + child.data.author;
    }

    // Gfycat.getData(...)
    // ... Images.push(GfycatImages)
    Imgur.getData(child.data.url, { imgPath: imgPath }, function (err, images) {
      if (err) {
        Log.error(err);
        return callback(err);
      }
      Images.push(images);
      callback();
    });


  // when all posts have been iterated
  }, function (err) {

    if (err) {
      Log.error(err);
      return callback(err);
    }
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
