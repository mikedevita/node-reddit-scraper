var async   = require('async');
var request = require('request');
var config  = require('../config');
var Log     = require('./logger');

function _retrieve(url, callback){
  Log.debug('Reddit::_retrieve() - Reddit URL is ' + url);
  request.get(url, function (err, res) {

    if (err) {
      Log.error('Reddit::_retrieve() - ' + err);
      return callback(err);
    }

    var page = JSON.parse(res.body);
    callback(null, page);
  });
}

module.exports = {
  buildUrl: function (redditUrl, sub) {
    var url =  redditUrl + '/r/' + sub.name + '.json?sort=' + sub.sortBy;
    if (sub.limit) {
      var limit = (!sub.limit || sub.limit > 100) ? 100 : sub.limit;
      // force a max of 100, otherwise return whatever the set limit is
      url = url + '&limit=' + limit;
    }

    Log.debug('Reddit::buildUrl() - url is ' + url);
    return url;
  },
  getData: function (redditUrl, sub, callback) {
    var url = module.exports.buildUrl(redditUrl, sub);
    Log.info('Reddit URL is: ' + url);
    var pagesCount = 1;
    var pages = [];
    Log.info('Retrieving the first page of reddit posts in /r/' + sub.name);

    _retrieve(url, function (err, page) {
      if (err) {
        Log.error(err);
        return callback(err);
      }

      var currentPage = page;
      Log.info('Retrieved the first page of reddit posts in /r/' + sub.name);
      pages.push(currentPage);

      if (sub.paging) {
        Log.info('Paging is enabled, grabbing a total of ' + sub.pages + ' pages');

        Log.info('Grabbed ' + pagesCount + '/' + sub.pages + ' total pages');
        async.whilst(
          function () { return pagesCount < sub.pages; },
          function (cb) {
            url = url + '&after=' + currentPage.data.after;
            setTimeout(function () {
              _retrieve(url, function (err, page) {
                Log.debug('Reddit::getData() :: pagingLoop');
                // @todo handle error
                currentPage = page;
                pages.push( currentPage );

                pagesCount++;
                Log.info('Grabbed ' + pagesCount + '/' + sub.pages + ' total pages');
                cb();
              });
            }, config.reddit.rateLimit);
          }, function (err, results) {
            if (err) {
              Log.error(err);
            }
            callback(null, pages);
          }
        );
      } else {
        callback(null, pages);
      }

    });
  }

};
