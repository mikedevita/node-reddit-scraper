var Imgur = require('../../lib/imgur');
var config = require('../../config');
var should = require('should');

describe('Imgur Lib', function () {
  describe('matchType', function () {

    it('should compute the right imgur link given a hash url', function (done) {
      var url = 'http://imgur.com/Ly6dDPX';
      Imgur.matchType(url, function (err, payload) {
        if (err) {
          return done(err);
        }

        payload.should.have.properties(['type', 'id']);
        payload.type.should.eql('hash');
        done();
      });
    });

    it('should compute the right imgur link given an album url', function (done) {
      var url = 'http://imgur.com/a/c1TeX';
      Imgur.matchType(url, function (err, payload) {
        if (err) {
          return done(err);
        }

        payload.should.have.properties(['type', 'id']);
        payload.type.should.eql('album');
        done();
      });
    });

    it('should compute the right imgur link given an image url', function (done) {
      var url = 'http://i.imgur.com/uEcOS31.png';
      Imgur.matchType(url, function (err, payload) {
        if (err) {
          return done(err);
        }

        payload.should.have.properties(['type']);
        payload.type.should.eql('image');
        done();
      });
    });
  });

  describe('getData', function () {
    it('should return an object of image info from a hash', function (done) {
      var hash = 'Ly6dDPX';
      Imgur.getData('hash', hash,  config.imgur, function (err, response) {
        if (err) {
          return done(err);
        }
        var image = response.image;
        image.should.have.property(['links']);
        image.image.should.have.properties(['title', 'caption', 'hash', 'type']);
        image.image.hash.should.eql(hash);
        done();
      });
    });
    it('should return an array of all images from an album', function (done) {
      var album = 'c1TeX';
      Imgur.getData('album', album,  config.imgur, function (err, response) {
        if (err) {
          return done(err);
        }
        var album = response.album;
        album.should.have.properties(['title', 'description', 'cover', 'layout', 'images']);
        album.images.should.be.an.Array();
        done();
      });
    });
  });
});
