var request = require('request');
var config  = require('../config');
var Log     = require('./logger');
var _       = require('lodash');

function _request(url, callback) {
  Log.debug('Gfycat::_request() - Getting data from url ' + url);
  request.get(url, function (err, res) {
    if (err) {
      Log.error('Gfycat::_request() - ' + err);
      return callback(err);
    }

    if (res.statusCode !== 200) {
      Log.error('Gfycat::_request() - ' + res.body);
      return callback(res.body);
    }

    Log.debug('Gfycat::_request() - data retrieved.');
    callback(null, JSON.parse(res.body));
  });
}

var Gfycat;
Gfycat = {
  getData: function getData(url, options, callback) {
    options = _.extend({}, config.gfycat, options);
    var parsedUrl = url.match(new RegExp(/^https?:\/\/(www.)?(['giant'|'zippy'].+)?gfycat.com\/([a-zA-Z0-9]+)(.['jpg'|'gif'|'gifv'|'webm'|'png']+)?/));

    Log.debug('Gfycat::getData() - retrieving data from gfycat API for url ' + url);
    _request(options.url + '/' + parsedUrl[3], function (err, res) {
      if (err) {
        Log.error('Gfycat::getData() - ' + err);
        return callback(err);
      }

      Log.debug('Gfycat::getData() - data retrieved.');
      var image = res.gfyItem;
      return callback(null, [{ url: image.webmUrl, imgPath: options.imgPath }]);
    });
  }
};
module.exports = Gfycat;
