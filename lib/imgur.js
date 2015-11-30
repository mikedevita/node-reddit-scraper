var request = require('request');
var config  = require('../config');
var Log     = require('./logger');

var Imgur;
Imgur = {

  /**
   * matchType
   * matches an imgur URL to an imgur type (hash, image, album)
   * and returns the appropriate imgur ID.
   *
   * @param  {String}   url      full URL to be parsed
   * @param  {Function} callback { err, data } expects data to have type and payload props
   */
  matchType: function matchType(url, callback) {
    Log.debug('Imgur::matchType() - Attempting to match url: ' + url);

    var hash = url.match(new RegExp('^https?:\/\/(www.)?imgur.com\/(?!gallery|a\/)([a-zA-Z0-9]+)'));
    var album = url.match(new RegExp('^https?:\/\/(www.)?imgur.com\/a\/([a-zA-Z0-9]+)'));
    var payload = {};

    if ( hash ) {
      payload = { type: 'hash', id: hash[2] };
    } else if (album) {
      payload = { type: 'album', id: album[2] };
    } else {
      payload = { type: 'image' };
    }

    Log.debug('Imgur::matchType() - Imgur URL matched as type: ' + payload.type);
    return callback(null, payload);
  },

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
  getData: function getData(type, hash, options, callback){
    var url = options.urls[type] + '/' + hash + '.json';
    Log.debug('Imgur::getData() - retreiving data from imgur api');
    setTimeout(function () {
      request.get(url, function (err, res) {
        if (err) {
          Log.error('Imgur::getData() - ' + err);
          return callback(err);
        }

        if (res.statusCode !== 200) {
          Log.error('Imgur::getData() - ' + err, res);
          return callback(err);
        }

        Log.debug('Imgur::getData() - data retrieved.');
        callback(null, JSON.parse(res.body));
      });
    }, config.imgur.rateLimit);
  }
};
module.exports = Imgur;
