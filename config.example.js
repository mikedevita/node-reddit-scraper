var pkg = require('./package.json');

module.exports = {
  concurrents: 10,
  reddit: {
    rateLimit: 3500,
    url: 'https://ssl.reddit.com',
    userAgent: 'scraperBot/' + pkg.version + ' by ndboost'
  },
  gfycat: {
    url: 'http://gfycat.com/cajax/get',
    domains: ['gfycat.com', 'zippy.gfycat.com', 'giant.gifycat.com']
  },
  imgur: {
    rateLimit: 2000,
    domains: ['i.imgur.com', 'imgur.com', 'm.imgur.com'],
    urls: {
      hash: 'https://api.imgur.com/2/image',
      album: 'http://api.imgur.com/2/album'
    }
  },
  log: {
    level: 'error',
    handleExceptions: true,
    colorize: true,
    prettyPrint: true
  },
  subreddits: [
    {
      storeByUser: true,
      name: 'pics',
      imgStore: 'data/pics',
      sortBy: 'new',
      paging: true,
      nsfw: true,
      pages: 2,
      limit: 100 //default is 25, max is 100 per reddit api
    },
    {
      storeByUser: false,
      name: 'funny',
      imgStore: 'data/funny',
      sortBy: 'new',
      paging: false,
      nsfw: true,
      pages: 1,
      limit: 25 //default is 25, max is 100 per reddit api
    }
  ]
};
