var async   = require('async');
var config  = require('./config');
var Reddit  = require('./lib/reddit');
var Scraper = require('./lib/scraper');
var Log     = require('./lib/logger');
var pages   = require('./pages.json');
var subreddits = config.subreddits;

Log.info('Initializing ' + config.reddit.userAgent);
async.each(subreddits, function (subreddit, subCallback) {
  Log.info('Processing subreddit ' + subreddit.name);

  function scraperCallback(err, pages) {

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
  }

  // stub out mock data for dev/test mode
  if ( process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    scraperCallback(null, pages);
  } else {
    Reddit.getData(config.reddit.url, subreddit, scraperCallback);
  }
});
