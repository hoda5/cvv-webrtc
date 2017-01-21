var erro = false;
var webdriverio = require('webdriverio'), By = webdriverio.by;
var options = {
    desiredCapabilities: {
        browserName: 'chrome',
    }
};

var a = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .click('#btnOP')
    .element('.esperaOP')
    .getText().then(function (title) {
        console.log('elem: .esperaOP');
        var t = 'Escolha como você quer falar com a gente';
        if (title.indexOf(t) == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: ' + t);
    })
    .element('.checkbox-texto')
    .getText().then(function (title) {
        console.log('elem: .checkbox-texto');
        var t = 'Quero ser atendido(a) por chat';
        if (title.indexOf(t) == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: ' + t);
    })
    .element('.checkbox-video')
    .getText().then(function (title) {
        console.log('elem: .checkbox-video');
        var t = 'Quero ser atendido(a) por vídeo';
        if (title.indexOf(t) == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: ' + t);
    })
    .element('.checkbox-audio')
    .getText().then(function (title) {
        console.log('elem: .checkbox-audio');
        var t = 'Quero ser atendido(a) por voz';
        if (title.indexOf(t) == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: ' + t);
    })
    .element('#procurando')
    .getText().then(function (title) {
        console.log('elem: #procurando');
        var t = 'Aguarde alguns instantes que um de nossos voluntários já vai te atender.';
        if (title.indexOf(t) == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: ' + t);
    })
    .isVisible('.btnHome').then(function (visible) {
        console.log('elem: .btnHome');
        if (!visible)
            console.log('o elemento não está visivel');
    })
    .catch(function (err) {
        console.log(err);
        process.exit(1);
    })
    .end();
