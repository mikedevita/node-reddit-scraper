const async = require('async');
const Axios  = require('axios');
const config = require('../config');
const Log    = require('./logger');

const retrieve = (url) => new Promise((resolve, reject) => {
  Axios
  .get(url)
  .then((res) => {
    if (err) {
      Log.error('Reddit::_retrieve() - ' + err);
      return reject(err);
    }

    if (res.statusCode !== 200) {
      Log.error('Reddit::_retrieve() - ' + err, res.statusCode, res.body);
      return reject({ statusCode: res.statusCode, body: res.body });
    }

    var body = JSON.parse(res.body);
    return resolve(body);
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

  getPosts: (redditUrl, sub) => new Promise((resolve, reject) => {
    var baseUrl = module.exports.buildUrl(redditUrl, sub);
    var pagesCount = 1;
    var pages = [];

    retrieve(baseUrl)
    .then()
  }),

  /**
   * 
   * @param {string} redditUrl reddit URL to 
   * @param {*} sub 
   * @param {*} callback 
   */
  getMediaFromPosts: (redditUrl, sub) => new Promise((resolve, reject) => {
    var baseUrl = module.exports.buildUrl(redditUrl, sub);
    var pagesCount = 1;
    var pages = [];
    Log.debug('Reddit::getData() - Retrieving the first page of reddit posts in /r/' + sub.name);
  })
}