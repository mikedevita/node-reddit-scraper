var Gfycat = require('../../lib/gfycat');
var config = require('../../config');
var should = require('should');

describe('Gfycat Lib', function () {
  describe('getData', function () {
    it('should return an array of image url from a url', function (done) {
      var url = 'http://giant.gfycat.com/GrandioseChiefBluetonguelizard.gif';
      Gfycat.getData(url, { imgPath: 'data/test' }, function (err, response) {
        if (err) {
          return done(err);
        }
        var image = response;
        image.should.be.an.Array();
        image.length.should.eql(1);
        done();
      });
    });
  });
});
