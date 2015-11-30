# node-reddit-scraper [![Build Status](https://travis-ci.org/mikedevita/node-reddit-scraper.svg)](https://travis-ci.org/mikedevita/node-reddit-scraper) [![Join the chat at https://gitter.im/mikedevita/node-reddit-scraper](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mikedevita/node-reddit-scraper?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


a node.js powered asynchronous scraper for reddit and imgur images.

Supports multiple subreddits in the config file. At the present moment only supports images from imgur.

## Installation
Installation is straight forward

```
git clone https://github.com/mikedevita/node-reddit-scraper;
cd node-reddit-scraper;
cp config.example.js config.js
npm install;
```

## Usage
This app is designed to be run via crontab or based on some sort of schedule.

Edit the `config.js` file to include your subreddits, use the example as a guidelines.

To invoke, just run `npm run` or `node index.js`.

You can use this on a crontab like so..

```
# run every day at midnight
0	0	*	*	*	node /path/to/node-reddit-scraper/index.js
```

## Contributing
pull requests are welcomed, just please adhere to the .eslintrc and .editorconfig's provided. Also run tests and make sure they pass fully.

To run tests just use `npm test` to execute the tests.

**Note** Due to how long reddit takes to respond the Reddit unit tests might fail due to a timeout error, if thats the case re run it or skip that single test.
