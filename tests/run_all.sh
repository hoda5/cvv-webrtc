var erro = false;
var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'chrome',
    }
};

//firefox tamanho desktop
var a = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .getTitle().then(function (title) {
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .getTitle().then(function (title) {
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .element('#btnOP')
    .getText().then(function (text) {
        if (text.indexOf('FALE COM O CVV') == -1)
            console.log('O texto está errado, devia ser: Fale com o CVV', text);
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .element('#btnSobre')
    .getText().then(function (text) {
        if (text.indexOf('SOBRE O CVV') == -1)
            console.log('O texto está errado, devia ser: Sobre o CVV', text);
    })
    .catch(function (err) {
      process.exit(1);
    })
    .element('#btnVol')
    .getText().then(function (text) {
        if (text.indexOf('ACESSO DE VOLUNTÁRIOS') == -1)
            console.log('O texto está errado, devia ser: Acesso de voluntários', text);
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .click('#btnOP')
    .element('#procurando')
    .getText().then(function (text) {
        if (text.indexOf('Aguarde alguns instantes que um de nossos voluntários já vai te atender.') == -1)
            console.log('O texto está errado, devia ser: Aguarde alguns instantes que um de nossos voluntários já vai te atender.');
    })
    .getUrl().then(function (url) {
        if (url.indexOf('http://localhost:5000/o-espera.html') == -1)
            console.log('A url esta errada. Deveria ser: http://localhost:5000/o-espera.html');
    });

//firefox tamanho mobile
var b = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .getTitle().then(function (title) {
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .getTitle().then(function (title) {
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .element('#btnOP')
    .getText().then(function (text) {
        if (text.indexOf('FALE COM O CVV') == -1)
            console.log('O texto está errado, devia ser: Fale com o CVV', text);
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .element('#btnSobre')
    .getText().then(function (text) {
        if (text.indexOf('SOBRE O CVV') == -1)
            console.log('O texto está errado, devia ser: Sobre o CVV', text);
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .element('#btnVol')
    .getText().then(function (text) {
        if (text.indexOf('ACESSO DE VOLUNTÁRIOS') == -1)
            console.log('O texto está errado, devia ser: Acesso de voluntários', text);
    })
    .catch(function (err) {
      console.log(err);
      process.exit(1);
    })
    .click('#btnOP')
    .element('#procurando')
    .getText().then(function (text) {
        if (text.indexOf('Aguarde alguns instantes que um de nossos voluntários já vai te atender.') == -1)
            console.log('O texto está errado, devia ser: Aguarde alguns instantes que um de nossos voluntários já vai te atender.');
    })
    .getUrl().then(function (url) {
        if (url.indexOf('http://localhost:5000/o-espera.html') == -1)
            console.log('A url esta errada. Deveria ser: http://localhost:5000/o-espera.html');
    });


a.then(function () {
    return b.then(function () {
        a.end()
        b.end()
    })
})


function err(str) {
    console.log(str);
    erro = true;
}