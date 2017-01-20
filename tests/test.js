
var webdriverio = require('webdriverio');
var aberto=[];
process.on('exit', encerraTudo);

describe('OP esperando atendimento', function() {
    var op=ana();
    it('Abre a página do CVV', function() {
        return op.url('http://www.google.com');
    })
    it('Verifica o título', function(done) {
       op.getTitle().then(function(title) {
          console.log('Title was: ' + title);        
          done;
        });
    })
    it('Esperar', function(done) {
        setTimeout(done, 10);
    })
    it('Fechar o navegador', function() {
        return encerra(r);
    })
})


function ana() {
    var options = {
        desiredCapabilities: {
            browserName: 'chrome'
        }
    };
    var r= webdriverio
        .remote(options)    
        .init();
    aberto.push(r);
    return r;
}

function encerra(r) {
    var i=aberto.indexOf(r);
    if (i>=0) aberto.splice(i,1);
    try{
        return r.end();
    }
    catch(e) {

    }
}

function encerraTudo() {
    while (aberto.length) 
        encerra(aberto[0]);
}

