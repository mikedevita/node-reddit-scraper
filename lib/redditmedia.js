var request = require('request');
var config  = require('../config');
var Log     = require('./logger');
var _       = require('lodash');


function _request(url, callback) {
  Log.debug('RedditMedia::_request() - Getting data from url ' + url);
  request.get({
    url: url
  }, function (err, res) {
    if (err) {
      Log.error('RedditMedia::_request() - ' + err);
      return callback(err);
    }

    if (res.statusCode !== 200) {
      Log.error('RedditMedia::_request() ' + url + res.statusCode);
      return callback(res.body);
    }

    Log.debug('RedditMedia::_request() - data retrieved.');
    return callback(null, JSON.parse(res.body));
  });
}

var RedditMedia;
RedditMedia = {
  getData: function getRedditMediaData (url, options, callback) {
    callback(null, [{ url: url, imgPath: options.imgPath }]);
  }
}
module.exports = RedditMedia;
