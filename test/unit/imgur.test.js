var Imgur = require('../../lib/imgur');
var config = require('../../config');
var should = require('should');

describe('Imgur Lib', function () {
  describe('getData', function () {
    it('should return an array of image url from a url', function (done) {
      var url = 'http://i.imgur.com/Ly6dDPX.jpg';
      Imgur.getData(url, { imgPath: 'data/test' }, function (err, response) {
        if (err) {
          return done(err);
        }
        var image = response;
        image.should.be.an.Array();
        image.length.should.eql(1);
        done();
      });
    });

    it('should return an object of image info from a hash', function (done) {
      var url = 'http://imgur.com/Ly6dDPX';
      Imgur.getData(url, { imgPath: 'data/test' }, function (err, response) {
        if (err) {
          return done(err);
        }
        var image = response;
        image.should.be.an.Array();
        image.length.should.eql(1);
        done();
      });
    });
    it('should return an array of all images from an album', function (done) {
      var url = 'http://imgur.com/a/c1TeX';
      Imgur.getData(url, { imgPath: 'data/test' }, function (err, response) {
        if (err) {
          return done(err);
        }

        var images = response;
        images.should.be.an.Array();
        done();
      });
    });
  });
});
