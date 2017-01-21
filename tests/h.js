const webdriverio = require('webdriverio');
const Future = require('fibers/future');
const Fiber = require('fibers');
const assert = require('chai').assert;

var pending = [];

var personas = {
  messias: {
    options: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    init: function (browser) {
      browser.windowHandlePosition({x: 20, y: 0});
      browser.setViewportSize({
        width: 320,
        height: 786
      });
    }
  },
  ana: {
    options: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    init: function (browser) {
      browser.windowHandlePosition({x: 350, y: 0});
      browser.setViewportSize({
        width: 320,
        height: 586
      });
    }
  }
};

var test_result;

module.exports = {
  domain: 'http://localhost:5000/',
  run: function run(opts, test, callback) {
    test_result = 0;
    var browsers = [];
    opts.personas.forEach(function (p) {
      var options = personas[p].options;
      var b = getBrowser(p, opts, options);
      pending.push(b);
      browsers.push(b);
    });

    var self = this;
    Fiber(function () {
      try {
        try {
          opts.personas.forEach(function (p, idx) {
            var browser=browsers[idx];
            browser.init();
            personas[p].init(browser);
          })
          test.apply(this, browsers);
        }
        finally {
          endBrowsers(browsers);
        }
        callback();
      } catch (error) {
        callback(error);
        test_result = 1;
      }
      process.exit(test_result)
    }).run();
  }
};

var verboseResult = {
  getTitle: true,
  getText: true,
  isVisible: true
};

function getAsyncCommandWrapper(opts, fn) {
  if (opts.commandName == 'endx')
    return function (arg1, arg2, arg3, arg4, arg5) {
      if (opts.verbose) show_exec(opts, arguments);
      fn.call(this, arg1, arg2, arg3, arg4, arg5)
    };
  return function (arg1, arg2, arg3, arg4, arg5) {
    if (opts.verbose) show_exec(opts, arguments);
    try {
      if (!Fiber.current)
        throw new Error('not in Fiber');
      var r = Future.fromPromise(fn.call(this, arg1, arg2, arg3, arg4, arg5)).wait();
      if (opts.verbose && verboseResult[opts.commandName])
        console.log('  result=', JSON.stringify(r));
      return r;
    }
    catch (e) {
      console.log(e);
      throw e;
    }
  }
}

function show_exec(opts, args) {
  var str = [
    opts.persona, '.', opts.commandName, '(',
    Array.prototype.slice.call(args).map(function (a) {
      return JSON.stringify(a);
    }).join(', '),
    ')'];
  console.log(str.join(''));
}

function getWaitUntilCommandWrapper(opts, fn) {
  return getAsyncCommandWrapper(opts, function (condition, ms, interval) {
    return fn.call(this, function () {
      return new Promise(function (resolve, reject) {
        Fiber(function () {
          try {
            resolve(condition());
          } catch (error) {
            reject(error)
          }
        }).run();
      });
    }, ms, interval);
  });
}

function getBrowser(name, opts, options) {
  var instance = webdriverio.remote(options);

  const SYNC_COMMANDS = ['domain', '_events', '_maxListeners', 'setMaxListeners', 'emit',
    'addListener', 'on', 'once', 'removeListener', 'removeAllListeners', 'listeners',
    'getMaxListeners', 'listenerCount'];

  const SPECIAL_COMMANDS = ['waitUntil'];

  Object.keys(Object.getPrototypeOf(instance)).forEach(function (commandName) {
    if (SYNC_COMMANDS.indexOf(commandName) === -1 && SPECIAL_COMMANDS.indexOf(commandName) === -1) {
      instance[commandName] = getAsyncCommandWrapper(
        {
          persona: name,
          verbose: opts.verbose,
          commandName: commandName
        },
        instance[commandName]);
    }
  });

  instance.waitUntil = getWaitUntilCommandWrapper({
    persona: name,
    verbose: opts.verbose,
    commandName: 'waitUntil'
  }, instance.waitUntil);
  instance.addCommand = function (name, code) {
    instance[name] = function (arg1, arg2, arg3, arg4, arg5) {
      if (opts.verbose) show_exec({
        persona: name,
        verbose: opts.verbose,
        commandName: name
      }, arguments);
      code.call(this, arg1, arg2, arg3, arg4, arg5)
    }
  };

  instance.addCommand("check_text", function () {
    var self = this;
    var t;
    if (arguments[1]) {
      t = {};
      t[arguments[0]] = arguments[1];
    }
    else t = arguments[0]
    var k = Object.keys(t);
    if (k.length == 0) assert.fail(arguments);
    k.forEach(function (selector) {
      var expectedText = t[selector];
      var text = self.getText(selector);
      assert.equal(text, expectedText, 'getText("' + selector + '")');
    })
  });

  instance.addCommand("wait_text", function (texts, timeout, message) {
    var self = this;
    var t;
    var k = Object.keys(texts);
    if (k.length == 0) assert.fail(arguments);
    self.waitUntil(function () {
      if (opts.verbose)
        console.log('  ---- ' + name + '.wait_text');
      for (var i = 0; i < k.length; i++) {
        var selector = k[i];
        var expectedText = texts[selector];
        var text = self.getText(selector);
        if (opts.verbose)
          console.log('  expect=', JSON.stringify(expectedText));
        if (text == expectedText) {
          k.splice(i, 1);
          i--;
        }
      }
      return k.length == 0;
    }, timeout || 1000, message);
  });

  instance.addCommand("check_visible", function (selector) {
    if (!this.isVisible(selector))
      assert.fail('isVisible("' + selector + '") failed');
  });

  instance.addCommand("check_dashboard", function (a, f) {
    var self = this;
    self.waitUntil(function () {
      var text = self.getText('#statTexto > .a');
      return text != '- em atendimento';
    }, 10000, 'dashboard não inicializado');

    this.wait_text(
      {
        '#statTexto > .a': [a[0], ' em atendimento'].join(''),
        '#statAudio > .a': [a[1], ' em atendimento'].join(''),
        '#statVideo > .a': [a[2], ' em atendimento'].join(''),
        '#statVoluntario > .a': [a[3], ' em atendimento'].join(''),

        '#statTexto > .f': [f[0], ' na fila'].join(''),
        '#statAudio > .f': [f[1], ' na fila'].join(''),
        '#statVideo > .f': [f[2], ' na fila'].join(''),
        '#statVoluntario > .f': [f[3], ' ociosos(as)'].join('')
      }
      , 10000, 'Erro no dashboard');
  });

  return instance;
};

function endBrowsers(arr) {
  while (arr.length > 0) {
    var b = arr.shift();
    var idx = pending.indexOf(b);
    if (idx >= 0) pending.splice(idx, 1);
    try {
      b.end();
    }
    catch (e) {
      //
    }
  }
}

process.stdin.resume();
function exitHandler(options, err) {
  if (options.cleanup) Fiber(function () {
    endBrowsers(pending)
  }).run();
  if (err) console.log(err.stack);
  if (options.exit) process.exit();
}

process.on('beforeExit', exitHandler.bind(null, { cleanup: true }));

process.on('SIGINT', exitHandler.bind(null, { exit: true }));

process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
