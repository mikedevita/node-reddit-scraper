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

function scrape(sub, page, callback){
  var children = page.data.children;

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
    if ( !_.includes(config.domains, child.data.domain, 0) ){
      return false;
    }
    return true;
  });

  async.eachLimit(results, config.concurrents, function (child, callback) {

    var imgPath = path.join(sub.imgStore);

    if (sub.storeByUser) {
      imgPath = imgPath + '/' + child.data.author;
    }

    Imgur.matchType(child.data.url, function (err, payload) {
      if (err) {
        Log.error(err);
        return callback(err);
      }

      switch (payload.type) {
        /**
         * URL is a hash URL, find the direct image link
         * and download it.
         */
        case 'hash':
          Imgur.getData('hash', payload.id, config.imgur, function (err, image){
            if (err) {
              Log.error(err);
              return callback(err);
            }

            var url = image.image.links.original;
            Images.push({ url: url, imgPath: imgPath });
          });
          break;
        /**
         * URL is an album URL
         * iterate over the images and download each one.
         */
        case 'album':
          Imgur.getData('album', payload.id, config.imgur, function (err, images){
            // @todo handle err
            images = images.album.images;

            for (var i = 0; i < images.length; i++) {
              Images.push({ url: images[i].links.original, imgPath: imgPath });
            }
          });
          break;
        /**
         * URL is direct link
         */
        default:
          Images.push({ url: child.data.url, imgPath: imgPath });
      }
      callback();
    });
  }, function (err) {

    if (err) {
      Log.error(err);
      return callback(err);
    }

    async.eachLimit(Images, config.concurrents, function (image, callback) {
      module.exports.download(image.url, image.imgPath, function (err, file) {
        if (err) {
          Log.error('Scraper - ' + err);
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

function download(url, path, callback){
  var fileName = url.substr(url.lastIndexOf('/') + 1);
  var sanitizedFileName = sanitize(fileName);

  mkdirp(path, function (err) {
    if (err) {
      throw err;
    }

    fs.exists(path + '/' + sanitizedFileName, function (exists) {
      if (!exists) {
        request.get(url).pipe(fs.createWriteStream(path + '/' + sanitizedFileName));
        callback(null, path + '/' + sanitizedFileName);
      } else {
        callback('File exists, not re-downloaded');
      }
    });
  });
}


module.exports = {
  scrape: scrape,
  download: download
};
