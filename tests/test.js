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
        console.log('V1')
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })

var b = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .getTitle().then(function (title) {
        console.log('V2')
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })

var c = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .click('#btnOP')
    .element('#procurando')
    .getText().then(function (text) {
        console.log('V3')
        if (title.indexOf('Aguarde alguns instantes que um de nossos voluntários já vai te atender.') == -1)
            console.log('O texto está errado, devia ser: Aguarde alguns instantes que um de nossos voluntários já vai te atender.');
    })

var d = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .click('#btnOP')
    .getUrl().then(function (url) {
        console.log('V4')
        if (title.indexOf('http://localhost:5000/o1.html') == -1)
            console.log('A url esta errada. Deveria ser: http://localhost:5000/o1.html');
    })

var e = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .element('#btnOP')
    .getText().then(function (text) {
        console.log('V5')
        if (title.indexOf('Fale com o CVV') == -1)
            console.log('O texto está errado, devia ser: Fale com o CVV');
    })

var f = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .element('#btnSobre')
    .getText().then(function (text) {
        console.log('V6')
        if (title.indexOf('Sobre o CVV') == -1)
            console.log('O texto está errado, devia ser: Sobre o CVV');
    })

var g = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .element('#btnVol')
    .getText().then(function (text) {
        console.log('V7')
        if (title.indexOf('Acesso de voluntários') == -1)
            console.log('O texto está errado, devia ser: Acesso de voluntários');
    })

a.then(function () {
    return b.then(function () {
        return c.then(function(){
            return d.then(function(){
                return e.then(function(){
                    return f.then(function(){
                        return g.then(function(){
                            a.end();
                            b.end();
                            c.end();
                            d.end();
                            e.end();
                            f.end();
                            g.end();
                            if (erro)
                                process.exit(1)
                        })
                    })
                })
            })
        })
    })
})

//mobile firefox tamanho iPhone
var a2 = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .getTitle().then(function (title) {
        console.log('V1_mobile')
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })

var b2 = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .getTitle().then(function (title) {
        console.log('V2_mobile')
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })

var c2 = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .click('#btnOP')
    .element('#procurando')
    .getText().then(function (text) {
        console.log('V3_mobile')
        if (title.indexOf('Aguarde alguns instantes que um de nossos voluntários já vai te atender.') == -1)
            console.log('O texto está errado, devia ser: Aguarde alguns instantes que um de nossos voluntários já vai te atender.');
    })

var d2 = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .click('#btnOP')
    .getUrl().then(function (url) {
        console.log('V4_mobile')
        if (title.indexOf('http://localhost:5000/o1.html') == -1)
            console.log('A url esta errada. Deveria ser: http://localhost:5000/o1.html');
    })

var e2 = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .element('#btnOP')
    .getText().then(function (text) {
        console.log('V5_mobile')
        if (title.indexOf('Fale com o CVV') == -1)
            console.log('O texto está errado, devia ser: Fale com o CVV');
    })

var f2 = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .element('#btnSobre')
    .getText().then(function (text) {
        console.log('V6_mobile')
        if (title.indexOf('Sobre o CVV') == -1)
            console.log('O texto está errado, devia ser: Sobre o CVV');
    })

var g2 = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .element('#btnVol')
    .getText().then(function (text) {
        console.log('V7_mobile')
        if (title.indexOf('Acesso de voluntários') == -1)
            console.log('O texto está errado, devia ser: Acesso de voluntários');
    })

a2.then(function () {
    return b2.then(function () {
        return c2.then(function(){
            return d2.then(function(){
                return e2.then(function(){
                    return f2.then(function(){
                        return g2.then(function(){
                            a2.end();
                            b2.end();
                            c2.end();
                            d2.end();
                            e2.end();
                            f2.end();
                            g2.end();
                            if (erro)
                                process.exit(1)
                        })
                    })
                })
            })
        })
    })
})


function err(str) {
    console.log(str);
    erro = true;
}