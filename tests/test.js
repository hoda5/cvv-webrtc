var erro = false;
var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'firefox',
    }
};
var options_iPhone = {
    desiredCapabilities: {
        browserName: 'chrome',
        size: { width: 320, height: 568 }
    }
};

var a = webdriverio
    .remote(options)
    .init()
    .url('http://localhost:5000/')
    .setViewportSize({ width: 320, height: 568 }, false)
    .getTitle().then(function (title) {
        console.log('V1')
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })

var b = webdriverio
    .remote(options_iPhone)
    .init()
    .url('http://localhost:5000/')
    .getTitle().then(function (title) {
        console.log('V2')
        if (title.indexOf('Exemplo WebRTC/AppCVV') == -1)
            console.log('O titulo esta errado, na tela esta:' + title + ', porem deveria ser: Exemplo WebRTC/AppCVV');
    })

a.then(function () {
    return b.then(function () {
        a.end();
        b.end();
        console.log('V3')
        if (erro)
            process.exit(1)
    })
})



// .remote(options_iPhone)
// .init()
// .url('http://localhost:5000/')
// .getTitle().then(function(title) {
//     if (title.indexOf('Exemplo WebRTC/AppCVV')== -1)
//         console.log('O titulo esta errado, na tela esta:'+title+', porem deveria ser: Exemplo WebRTC/AppCVV');
//     else console.log('V')
// })
// .end();


function erro(str) {
    console.log(str);
    erro = true;
}