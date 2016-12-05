var pkg = require('./package.json');

module.exports = {
  concurrents: 10,
  reddit: {
    rateLimit: 3500,
    url: 'https://ssl.reddit.com',
    userAgent: 'scraperBot/' + pkg.version + ' by ndboost'
  },
  gfycat: {
    enabled: true,
    url: 'http://gfycat.com/cajax/get',
    domains: ['gfycat.com', 'zippy.gfycat.com', 'giant.gfycat.com'],
    rateLimit: 2000
  },
  redditmedia: {
    enabled: true,
    urls: [
      'https://i.redd.it'
    ],
    domains: [
      'i.redd.it'
    ]
  },
  imgur: {
    enabled: true,
    domains: ['i.imgur.com', 'imgur.com', 'm.imgur.com'],
    rateLimit: 2000,
    auth: {
      clientId: null,
      clientSecret: null
    },
    urls: {
      hash: 'https://api.imgur.com/3/image',
      album: 'https://api.imgur.com/3/album'
    }
  },
  log: {
    level: 'info',
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
      pages: 5, // grab x pages if paging: true
      limit: 100 //default is 25, max is 100 per reddit api
    }
  ]
};
