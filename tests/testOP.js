
const assert = require('chai').assert;
const h = require('./h');

h.run(
  {
    personas: ['ana', 'messias'],
    verbose: true
  },
  function (ana, messias) {
    ana.url(h.domain);
    messias.url(h.domain + '/dashboard.html');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
    ana.click('#btnOP')
    ana.check_text('.esperaOP', 'Escolha como você quer falar com a gente')
    messias.check_dashboard([0, 0, 0, 0], [1, 1, 1, 0]);
    ana.check_text({
      '.checkbox-texto': 'Quero ser atendido(a) por chat',
      '.checkbox-audio': 'Quero ser atendido(a) por voz',
      '.checkbox-video': 'Quero ser atendido(a) por vídeo',
      '#procurando': 'Aguarde alguns instantes que um de nossos voluntários já vai te atender.'
    });
    ana.click('.checkbox-texto');
    messias.check_dashboard([0, 0, 0, 0], [0, 1, 1, 0]);
    ana.click('.checkbox-audio');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 1, 0]);
    ana.click('.checkbox-texto');
    messias.check_dashboard([0, 0, 0, 0], [1, 0, 1, 0]);
    ana.click('.checkbox-video');
    messias.check_dashboard([0, 0, 0, 0], [1, 0, 0, 0]);
    ana.click('.checkbox-audio');
    messias.check_dashboard([0, 0, 0, 0], [1, 1, 0, 0]);
    ana.click('.checkbox-video');
    messias.check_dashboard([0, 0, 0, 0], [1, 1, 1, 0]);
    ana.click('.btnHome');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (err)
      console.log(err);
    else
      console.log('OK')
  });
