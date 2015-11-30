var async   = require('async');
var config  = require('./config');
var Reddit  = require('./lib/reddit');
var Scraper = require('./lib/scraper');
var Log  = require('./lib/logger');


var subreddits = config.subreddits;

Log.info('Initializing ' + config.reddit.userAgent);
async.each(subreddits, function (subreddit, subCallback) {
  Log.info('Processing subreddit ' + subreddit.name);
  Reddit.getData(config.reddit.url, subreddit, function (err, pages) {

    if (err) {
      throw err;
    }

    if ( Array.isArray(pages) ) {
      async.eachLimit(pages, 1, function (page, callback) {
        Scraper.scrape(subreddit, page, callback);
      }, function (err) {
        if (err) {
          Log.error('Error processing ' + subreddit.name + ': ' + err);
        }
        subCallback(err);
      });
    }
  });
});
