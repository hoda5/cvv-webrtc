const webdriverio = require('webdriverio');
const Future = require('fibers/future');
const Fiber = require('fibers');
const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

var pending = [];

var personas = {
  messias: {
    options: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    init: function (browser) {
      browser.windowHandlePosition({ x: 20, y: 0 });
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
      browser.windowHandlePosition({ x: 350, y: 0 });
      browser.setViewportSize({
        width: 320,
        height: 586
      });
    }
  },
  maria: {
    options: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    init: function (browser) {
      browser.windowHandlePosition({ x: 700, y: 0 });
      browser.setViewportSize({
        width: 320,
        height: 586
      });
    }
  }
};


module.exports = {
  domain: 'http://localhost:5000/',
  run: function run(report_opts, test, callback) {
    var test_result;
    var report_dir, report_screenshots_dir, report_name, report_index, report_stream, report_browsers, report_level = 0;

    var n = process.argv[1]
      .replace(/\.js$/g, '').split(/[\/\\]/);
    report_name = n[n.length - 1];
    n[n.length - 1] = 'report';
    report_dir = n.join('/');
    report_screenshots_dir = report_dir + '/screenshots/' + report_name;
    rimraf.sync(report_screenshots_dir);
    mkdirp.sync(report_screenshots_dir);

    report_index = report_dir + '/report_' + report_name + '.html';
    report_stream = fs.createWriteStream(report_index, {
      flags: 'w',
      defaultEncoding: 'utf8',
      autoClose: true
    });
    report_stream.write('<html><head>'+report_css()+'</head><body>');

    test_result = 0;
    report_browsers = [];
    report_opts.personas.forEach(function (p) {
      var options = personas[p].options;
      var b = getBrowser(p, options);
      pending.push(b);
      report_browsers.push(b);
    });

    var self = this;
    Fiber(function () {
      try {
        try {
          report_opts.personas.forEach(function (p, idx) {
            var browser = report_browsers[idx];
            browser.init();
            personas[p].init(browser);
          })
          test.apply(this, report_browsers);
        }
        catch (e) {
          report_error({ persona: '?', verbose: report_opts.verbose }, e);
        }
        finally {
          endBrowsers(report_browsers);
        }
        callback();
      } catch (error) {
        callback(error);
        test_result = 1;
      }
      report_stream.write('</body></html>');
      report_stream.close();
      if (test_result)
        fs.renameSync(report_index, report_index.replace('.html', '.error.html'));
      process.exit(test_result)
    }).run();

    var verboseResult = {
      getTitle: true,
      getText: true,
      isVisible: true
    };

    function getAsyncCommandWrapper(opts, fn) {
      if (opts.commandName == 'endx')
        return function (arg1, arg2, arg3, arg4, arg5) {
          var self = this;
          report_cmd(opts, arguments, function () {
            fn.call(self, arg1, arg2, arg3, arg4, arg5)
          });
        };
      return function (arg1, arg2, arg3, arg4, arg5) {
        var self = this;
        return report_cmd(opts, arguments, function () {
          if (!Fiber.current)
            throw new Error('not in Fiber');
          return Future.fromPromise(fn.call(self, arg1, arg2, arg3, arg4, arg5)).wait();
        });
      }
    }

    function report_cmd(opts, args, code) {
      report_level++;
      try {
        if (report_level == 1) {
          report_stream.write('<div class="level1">');
          report_stream.write('<h3>');
        }
        else
          report_stream.write('<div class="sublevel">');

        var str = [
          opts.persona, '.', opts.commandName, '(',
          Array.prototype.slice.call(args).map(function (a) {
            return JSON.stringify(a);
          }).join(', '),
          ')'].join('');
        if (opts.verbose)
          console.log(str);
        report_stream.write(str);

        if (report_level == 1)
          report_stream.write('</h3>');
        var r = code();
        if (verboseResult[opts.commandName]) {
          if (opts.verbose)
            console.log('  result=', JSON.stringify(r));
          report_stream.write(' result=<span class="result">');
          report_stream.write(JSON.stringify(r));
          report_stream.write('<span>');
          report_stream.write('<br />');
        }
        report_stream.write('</div>');
        return r;
      }
      catch (e) {
        report_error(opts, e);
      }
      finally {
        report_level--;
      }
    }

    function report_error(opts, e) {
      if (!e.$reported)
        try {
          console.log(e)
          report_stream.write(opts.persona);
          report_stream.write(e.message);
          if (e.stack) {
            report_stream.write('<pre>');
            report_stream.write(e.stack.toString());
            report_stream.write('</pre>');
          }
          report_opts.personas.forEach(function (p, idx) {
            var browser = report_browsers[idx];
            var shot = [report_screenshots_dir, '/', p, '_', new Date().getTime(), '.png'].join('');
            report_stream.write(p);
            report_stream.write('<img src="');
            report_stream.write(shot);
            report_stream.write('">\n');
            browser.saveScreenshot(shot);
          });
          e.$reported = true;
        }
        catch (e2) {
          console.log(e2)
        }
      throw e;
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

    function getBrowser(personaName, options) {
      var instance = webdriverio.remote(options);

      const SYNC_COMMANDS = ['domain', '_events', '_maxListeners', 'setMaxListeners', 'emit',
        'addListener', 'on', 'once', 'removeListener', 'removeAllListeners', 'listeners',
        'getMaxListeners', 'listenerCount'];

      const SPECIAL_COMMANDS = ['waitUntil'];

      Object.keys(Object.getPrototypeOf(instance)).forEach(function (commandName) {
        if (SYNC_COMMANDS.indexOf(commandName) === -1 && SPECIAL_COMMANDS.indexOf(commandName) === -1) {
          instance[commandName] = getAsyncCommandWrapper(
            {
              persona: personaName,
              verbose: report_opts.verbose,
              commandName: commandName
            },
            instance[commandName]);
        }
      });

      instance.waitUntil = getWaitUntilCommandWrapper({
        persona: personaName,
        verbose: report_opts.verbose,
        commandName: 'waitUntil'
      }, instance.waitUntil);

      instance.addCommand = function (commandName, code) {
        instance[commandName] = function (arg1, arg2, arg3, arg4, arg5) {
          var self = this;
          var cmd_opts = {
            persona: personaName,
            verbose: report_opts.verbose,
            commandName: commandName
          };
          return report_cmd(cmd_opts, arguments, function () {
            code.call(self, arg1, arg2, arg3, arg4, arg5)
          });
        };
      };

      instance.addCommand("check_text", function (texts) {
        var self = this;
        var k = Object.keys(texts);
        if (k.length == 0) assert.fail(arguments);
        k.forEach(function (selector) {
          var expectedText = texts[selector];
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
          if (report_opts.verbose)
            console.log('  ---- ' + personaName + '.wait_text');
          for (var i = 0; i < k.length; i++) {
            var selector = k[i];
            try {
              var expectedText = texts[selector];
              var text = self.getText(selector);
              if (report_opts.verbose)
                console.log('  expect=', JSON.stringify(expectedText));
              if (text == expectedText) {
                k.splice(i, 1);
                i--;
              }
            }
            catch (e) {

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

      instance.addCommand("disponibilizar_atendimento", function (texto, audio, video) {
        var self = this;

        self.wait_text({ '#cvvindex': 'Exemplo WebRTC/AppCVV' }, 5000)

        self.click('#btnVol')
        self.wait_text({ '.demo-content h5': 'Acesso de voluntários' }, 5000)
        self.click('.btnPassword')
        self.wait_text({ '.demo-content h3': 'Voluntário Teste' }, 10000)

        self.click('#btnDisponibilidade');
        self.wait_text({ '.demo-content h5': 'Informe por quais canais você está se disponibilizando a atender' })

        if (!texto) self.click('[for="checkbox-texto"]');
        if (!audio) self.click('[for="checkbox-audio"]');
        if (!video) self.click('[for="checkbox-video"]');

        self.click('#btnDisponibilizar');
        self.wait_text({ '#procurando': 'Esperando que a outra pessoa nos procure' }, 5000)
      });

      instance.addCommand("solicitar_atendimento", function (texto, audio, video) {
        var self = this;

        self.wait_text({ '#cvvindex': 'Exemplo WebRTC/AppCVV' }, 5000)

        self.click('#btnOP')
        self.check_text({ '.esperaOP': 'Escolha como você quer falar com a gente' })

        if (!texto) self.click('[for="checkbox-texto"]');
        if (!audio) self.click('[for="checkbox-audio"]');
        if (!video) self.click('[for="checkbox-video"]');

        self.wait_text({ '#procurando': 'Aguarde alguns instantes que um de nossos voluntários já vai te atender.' }, 5000)
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
  }
};

function report_css() {
  return '<style>' +
    '.level1 h3 {color: blue;}'+
    '.sublevel {display: block}'+
    '.result {color: green}'+
    '</style>';
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
