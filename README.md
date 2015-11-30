# node-reddit-scraper
a node.js powered asynchronous scraper for reddit and imgur images.

Supports multiple subreddits in the config file. At the present moment only supports images from imgur.

## Installation
Installation is straight forward

```
git clone https://github.com/mikedevita/node-reddit-scraper;
cd node-reddit-scraper;
npm install;
```

## Usage
This app is designed to be run via crontab or based on some sort of schedule.

To invoke, just run `npm run` or `node index.js`.

## Contributing
pull requests are welcomed, just please adhere to the .eslintrc and .editorconfig's provided. Also run tests and make sure they pass fully.

To run tests just use `npm test` to execute the tests.

**Note** Due to how long reddit takes to respond the Reddit unit tests might fail due to a timeout error, if thats the case re run it or skip that single test.
