module.exports = {
  storeByUser: false,
  concurrents: 10,
  domains: ['i.imgur.com', 'imgur.com'],
  reddit: {
    url: 'https://ssl.reddit.com',
    userAgent: 'scraperBot/0.1 by ndboost',
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
  subreddits: [
    {
      name: 'pics',
      imgStore: 'pics',
      sortBy: 'new',
      paging: false,
      nsfw: true,
      pages: 10, 
      limit: 100
    },
    {
      name: 'funny',
      imgStore: 'funny',
      sortBy: 'new',
      paging: false,
      nsfw: true,
      pages: 10, 
      limit: 100
    }
  ]
}
