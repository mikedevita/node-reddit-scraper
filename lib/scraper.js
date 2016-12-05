var request      = require('request');
var fs           = require('fs');
var mkdirp       = require('mkdirp');
var _            = require('lodash');
var async        = require('async');
var path         = require('path');
var sanitize     = require('sanitize-filename');
var config       = require('../config');
var Imgur        = require('./imgur');
var Gfycat       = require('./gfycat');
var RedditMedia  = require('./redditmedia')
var Log          = require('./logger');


/** Array of image URLs **/
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
          Log.debug('Scraper::download() - File downloaded to ' + path + '/' + sanitizedFileName);
          callback(null, true);
        });
      } else {
        Log.debug('Scraper::download() - File ' + path + '/' + sanitizedFileName + ' exists, not re-downloaded');
        callback(null, false);
      }
    });
  });
}

function scrape(sub, page, options, callback){
  var Images = [];
  var children = page.data.children;
  Log.debug('Scraper::scrape() - ' + children.length + ' posts received');
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
      Log.debug('Scraper::scrape() - domain not in allowed list ' + child.data.domain);
      return false;
    }
    return true;
  });
  Log.debug('Scraper::scrape() - ' + results.length + ' total posts on this page viable for scraping.');

  // iterate over reddit posts (results)
  async.each(results, function (child, cb) {

    var imgPath = path.join(sub.imgStore);
    if (sub.storeByUser) {
      imgPath = imgPath + '/' + child.data.author;
    }

    if ( config.imgur.enabled && _.includes(config.imgur.domains, child.data.domain, 0) ) {
      Imgur.getDataV3(child.data.url, { imgPath: imgPath }, function (err, images) {
        if (err) {
          Log.error('Scraper::Imgur::getDataV3():: ' + err);
          // return cb(err);
        }

        if (images) {
          Images.push(images);
        }

        return cb();
      });
    } else if ( config.gfycat.enabled && _.includes(config.gfycat.domains, child.data.domain, 0) ) {
      Gfycat.getData(child.data.url, { imgPath: imgPath }, function (err, images) {
        if (err) {
          Log.error(err);
          return cb(err);
        }
        Images.push(images);
        return cb();
      });
    } else if ( config.redditmedia.enabled && _.includes(config.redditmedia.domains, child.data.domain, 0) ) {
      RedditMedia.getData(child.data.url, { imgPath: imgPath }, function (err, images) {
        if (err) {
          Log.error(err);
          return cb(err);
        }
        Images.push(images);
        return cb();
      });
    }


  // when all posts have been iterated
  }, function (err) {

    if (err) {
      Log.error('Scraper::async::Imgur::getDataV3():: ' + err);
      return callback(err);
    }
    return callback(null, Images);
  });
}

module.exports = {
  scrape: scrape,
  download: _download
};
