var Fiber = require('fibers');
var assert = require('assert');

var webdriverio = require('webdriverio'), By = webdriverio.by;
var options = {
  desiredCapabilities: {
    browserName: 'chrome',
  }
};

Fiber(function () {
  var browser = webdriverio.remote();
  var sessionID = browser.init();

  browser.url('/');
  var title = browser.getTitle();
  console.log(title)
  assert.equal(title, 'WebdriverIO - Selenium 2.0 javascript bindings for nodejs');

}).run();