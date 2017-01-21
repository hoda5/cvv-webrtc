const webdriverio = require('webdriverio');
const Future = require('fibers/future');
const Fiber = require('fibers');

var pending = [];

var personas = {
  ana: {
    options: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    init: function () {

    }
  }
};

var test_result;

module.exports = {
  run: function run(opts, test, callback) {
    test_result=0;
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
            browsers[idx].init();
            personas[p].init()
          })
          test.apply(this, browsers);
        }
        finally {
          endBrowsers(browsers);
        }
        callback();
      } catch (error) {
        callback(error);
        test_result=1;
      }
      process.exit(test_result)
    }).run();
  }
};

function getAsyncCommandWrapper(opts, fn) {
  if (opts.commandName == 'endx')
    return function (arg1, arg2, arg3, arg4, arg5) {
      if (opts.verbose) show(arguments);
      fn.call(this, arg1, arg2, arg3, arg4, arg5)
    };
  return function (arg1, arg2, arg3, arg4, arg5) {
    if (!Fiber.current)
      throw new Error('not in Fiber');
    if (opts.verbose) show(arguments);
    var r = Future.fromPromise(fn.call(this, arg1, arg2, arg3, arg4, arg5)).wait();
    // if (r && typeof r.value !== 'undefined')
    //   console.log('  result=', JSON.stringify(r.value));
    return r;
  }
  function show(args) {
    var str = [
      opts.persona, '.', opts.commandName, '(',
      Array.prototype.slice.call(args).map(function (a) {
        return JSON.stringify(a);
      }).join(', '),
      ')'];
    console.log(str.join(''));
  }
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
    instance[name] = code;
  };

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
