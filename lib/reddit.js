var request = require('request');
var Log     = require('./logger');

function _retrieve(url, callback){
  request.get(url, function (err, res) {

    if (err) {
      return callback(err);
    }

    var page = JSON.parse(res.body);
    callback(null, page);
  });
}

module.exports = {
  getData: function (redditUrl, sub, callback) {
    var url = redditUrl + '/r/' + sub.name + '.json?sort=' + sub.sortBy + '&limit=' + sub.limit;
    Log.debug('Reddit URL is: ' + url);
    var pagesCount = 1;
    var pages = [];

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

        while (pagesCount < sub.pages) {
          url = url + '&after=' + currentPage.data.after;
          _retrieve(url, function (err, page) {

            // @todo handle error
            currentPage = page;
            pages.push( currentPage );
          });
          pagesCount++;
        }
      }

      callback(null, pages);
    });
  }

};
