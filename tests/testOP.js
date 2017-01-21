
const assert = require('chai').assert;
const h = require('./h');

h.run(
  {
    personas: ['ana'],
    verbose: false
  },
  function (ana) {
    ana.url(h.domain);
    ana.click('#btnOP')
    ana.check_text('.esperaOP', 'Escolha como você quer falar com a gente')
    ana.check_text('.checkbox-texto', 'Quero ser atendido(a) por chat')
    ana.check_text('.checkbox-audio', 'Quero ser atendido(a) por voz')
    ana.check_text('.checkbox-video', 'Quero ser atendido(a) por vídeo')
    ana.check_text('#procurando', 'Aguarde alguns instantes que um de nossos voluntários já vai te atender.')
    ana.check_visible('.btnHome');
  },
  function (err) {
    if (err)
      console.log(err);
    else
      console.log('OK')
  });
