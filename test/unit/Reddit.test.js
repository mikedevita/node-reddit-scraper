var Reddit = require('../../lib/reddit');
var config = require('../../config');
var should = require('should');

describe('Reddit Lib', function () {

  describe('buildUrl()', function () {
    it('should return a valid reddit api url', function (done) {
      var subreddit = {
        storeByUser: true,
        name: 'pics',
        imgStore: 'data/pics',
        sortBy: 'new',
        paging: true,
        nsfw: true,
        pages: 2
      };

      var url = Reddit.buildUrl(config.reddit.url, subreddit);
      url.should.eql(config.reddit.url + '/r/' + subreddit.name + '.json?sort=' + subreddit.sortBy);

      done();
    });
  });
  describe('getData()', function () {
    it('with paging enabled, it should return a valid array of subreddit pages', function (done) {
      var subreddit = {
        storeByUser: true,
        name: 'pics',
        imgStore: 'data/pics',
        sortBy: 'new',
        paging: true,
        nsfw: true,
        pages: 2
      };

      Reddit.getData(config.reddit.url, subreddit, function (err, pages) {
        if (err) {
          return done(err);
        }
        pages.should.be.an.Array();
        pages.length.should.eql(subreddit.pages);
        pages[0].data.children.length.should.eql(27);
        return done();
      });
    });
  });
});
