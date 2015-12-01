var async   = require('async');
var config  = require('./config');
var Reddit  = require('./lib/reddit');
var Scraper = require('./lib/scraper');
var Log     = require('./lib/logger');
var pages   = require('./pages.json');
var _       = require('lodash');

var domains = [];
var services = [];
var subreddits = config.subreddits;

var stats = {
  totalImagesDownloaded: 0,
  totalImagesExisting: 0,
  totalPagesScraped: 0,
  totalSubredditsScraped: 0
};

console.log();
console.log('-----------------------------------------------');
Log.info('Initializing ' + config.reddit.userAgent);


if ( config.gfycat.enabled ) {
  services.push('gfycat');
  domains.push(config.gfycat.domains);
}

if ( config.imgur.enabled ) {
  services.push('imgur');
  domains.push(config.imgur.domains);
}

domains = _.flatten(domains);
var sr = subreddits.map(function (subreddit) {
  return subreddit.name;
});

Log.info('  Subreddits: ' + sr);
Log.info('  Services: ' + services);
console.log('-----------------------------------------------');
async.each(subreddits, function (subreddit, subCallback) {
  Log.info('Started Processing /r/' + subreddit.name);

  function scraperCallback(err, pages) {

    if (err) {
      throw err;
    }

    // iterate over each page of each subreddit
    if ( Array.isArray(pages) ) {
      var Images = [];
      var imagesDownloaded = 0;
      var existingImagesCount = 0;
      stats.totalSubredditsScraped++;
      async.forEachOf(pages, function (page, index, callback) {
        // scrape the subreddit page
        Scraper.scrape(subreddit, page, { domains: domains }, function (err, images) {

          images = _.flatten(images);
          Images.push( images );
          stats.totalPagesScraped++;
          callback();
        });
      }, function (err) {
        if (err) {
          Log.error('Error processing ' + subreddit.name + ': ' + err);
        }
        Images = _.flatten(Images);
        async.each(Images, function (image, cb) {
          Scraper.download(image.url, image.imgPath, function (err, wasDownloaded) {
            if (wasDownloaded) {
              imagesDownloaded++;
            } else {
              existingImagesCount++;
            }
            setTimeout(function () {
              cb(null);
            }, 3000);
          });
        }, function (err) {
          if (err) {
            Log.warn(err);
          }

          Log.info('Finished with /r/' + subreddit.name);
          Log.info('  Downloaded ' + imagesDownloaded, 'images.');
          Log.info('  ' + existingImagesCount, 'images already existing.');
          stats.totalImagesDownloaded += imagesDownloaded;
          stats.totalImagesExisting += existingImagesCount;
          subCallback(err);
        });
      });
    }
  }

  // stub out mock data for dev/test mode
  if ( process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    scraperCallback(null, pages);
  } else {
    Reddit.getData(config.reddit.url, subreddit, scraperCallback);
  }
}, function () {
  console.log();
  console.log('--------------------------');
  Log.info('Scraper run finished');
  Log.info('  Total Images Downloaded:', stats.totalImagesDownloaded);
  Log.info('  Total Pre-existing Images:', stats.totalImagesExisting);
  Log.info('  Total Subreddits Scraped:', stats.totalSubredditsScraped);
  Log.info('  Total Pages Scraped:', stats.totalPagesScraped);
  console.log('--------------------------');
});
