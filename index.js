var async   = require('async');
var config  = require('./config');
var Reddit  = require('./lib/reddit');
var Scraper = require('./lib/scraper');
var Log     = require('./lib/logger');
var pages   = require('./pages.json');
var _       = require('lodash');

var domains = [];
var subreddits = config.subreddits;

Log.info('Initializing ' + config.reddit.userAgent);


if ( config.gfycat.enabled ) {
  domains.push(config.gfycat.domains);
}

if ( config.imgur.enabled ) {
  domains.push(config.imgur.domains);
}

domains = _.flatten(domains);
Log.debug('Index - allowed domains are: ' + domains);

async.each(subreddits, function (subreddit, subCallback) {
  Log.info('Processing subreddit ' + subreddit.name);

  function scraperCallback(err, pages) {

    if (err) {
      throw err;
    }

    if ( Array.isArray(pages) ) {
      async.each(pages, function (page, callback) {
        Log.debug('Index - Scraping page');
        Scraper.scrape(subreddit, page, { domains: domains }, callback);
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
