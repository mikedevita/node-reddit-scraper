var request = require('request');
var config  = require('../config');
var Log     = require('./logger');
var _       = require('lodash');

function _request(url, callback) {
  Log.debug('Imgur::_request() - Getting data from url ' + url);
  request.get(url, function (err, res) {
    if (err) {
      Log.error('Imgur::_request() - ' + err);
      return callback(err);
    }

    if (res.statusCode !== 200) {
      Log.error('Imgur::_request() - ' + res.body);
      return callback(res.body);
    }

    Log.debug('Imgur::_request() - data retrieved.');
    callback(null, JSON.parse(res.body));
  });
}

var Imgur;
Imgur = {

  /**
   * getData
   * gets an imgur image based on the link type
   * and its hash. Returns a json object from the imgur API.
   *
   * @param  {String}   type     one of: hash, image, album
   * @param  {String}   hash     the imgur ID parsed from the url
   * @param  {Object}   options  imgur specific configs, like the API urls
   * @param  {Function} callback err, imgurObj
   *
   * @todo convert to promise based and get rid of the callbacks
   */
  getData: function getData(url, options, callback){
    options = _.extend({}, config.imgur, options);
    var hash = url.match(new RegExp(/^https?:\/\/(www.)?imgur.com\/(?!gallery|a\/)([a-zA-Z0-9]+)/));
    var image = url.match(new RegExp(/^https?:\/\/(www.)?i.imgur.com\/([a-zA-Z0-9]+)\.(['jpg'|'gif'|'gifv'|'webm'|'png']+)/));
    var album = url.match(new RegExp(/^https?:\/\/(www.)?imgur.com\/a\/([a-zA-Z0-9]+)/));
    var payload = {};

    if ( hash ) {
      payload = { type: 'hash', url: options.urls.hash + '/' + hash[2] + '.json' };
    } else if ( album ) {
      payload = { type: 'album', url:  options.urls.album + '/' + album[2] + '.json'};
    } else {
      payload = { type: 'image', url: url };
    }

    Log.debug('Imgur::getData() - ' + payload.url + ' is a ' + payload.type);
    switch (payload.type) {
      /**
       * URL is a hash URL, find the direct image link
       * and download it.
       */
      case 'hash':
        Log.debug('Imgur::getData()::hash - requesting data from imgur api');
        // Imgur.getData(child.data.url), config.imgur, ...
        _request(payload.url, function (err, image) {
          if (err) {
            Log.error(err);
            return callback(err);
          }
          Log.debug('Imgur::getData()::hash - data retrieved', image.image.links.original);
          return callback(null, [{ url: image.image.links.original, imgPath: options.imgPath }]);
        });
        break;
      /**
       * URL is an album URL
       * iterate over the images and download each one.
       */
      case 'album':
        var _images = [];
        Log.debug('Imgur::getData()::album - requesting data from imgur api');
        _request(payload.url, function (err, images) {
          if (err) {
            Log.error(err);
            return callback(err);
          }

          images = images.album.images;
          for (var i = 0; i < images.length; i++) {
            _images.push({ url: images[i].links.original, imgPath: options.imgPath });
          }
          return callback(null, _images);
        });
        break;
      /**
       * URL is direct link
       */
      case 'image':
      default:
        return callback(null, [{ url: payload.url, imgPath: options.imgPath }]);
    }
  }
};
module.exports = Imgur;
