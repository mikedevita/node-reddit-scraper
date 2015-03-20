module.exports = {
  storeByUser: false,
  imgStore: 'data',
  concurrents: 10,
  domains: ['i.imgur.com', 'imgur.com'],
  reddit: {
    url: 'https://ssl.reddit.com',
    userAgent: 'scraperBot/0.1 by ndboost',
    sub: 'wtf',
    sortBy: 'new',
    paging: false,
    nsfw: true,
    pages: 10, 
    limit: 1000,
  },
  imgur: {
    urls: {
      hash: "https://api.imgur.com/2/image",
      album: "http://api.imgur.com/2/album",
    }
  },
  log: {
    level: 'debug',
    handleExceptions: true,
    colorize: true,
    prettyPrint: true
  },
}