
const assert = require('chai').assert;
const h = require('./h');

h.run(
  {
    personas: ['maria', 'messias'],
    verbose: false
  },
  function (maria, messias) {
    maria.url(h.domain);
    messias.url(h.domain + '/dashboard.html');
    messias.execute('document.body.style.zoom="70%"');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
    maria.click('#btnVol')
    maria.wait_text({ '.demo-content h5': 'Acesso de voluntários' })
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.click('.btnPassword')
    maria.wait_text({ '.demo-content h3': 'Voluntário Teste' }, 5000)
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.click('#btnInformarDisponibilidade')
    maria.wait_text({ '.demo-content h5': 'Informe por quais canais você está se disponibilizando a atender' })
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.click('[for="checkbox-texto"]');
    maria.click('[for="checkbox-audio"]');
    maria.click('[for="checkbox-video"]');

    maria.sleep(50);
    if (maria.isEnabled('#btnDisponibilizar'))
      assert.fail('#btnDisponibilizar deveria estar desabilitado');

    maria.click('[for="checkbox-audio"]');
    maria.sleep(50);
    maria.waitUntil(function(){
      return maria.isEnabled('#btnDisponibilizar');
    }, 30000, '#btnDisponibilizar deveria estar habilitado, verifique permissoes de microfone');
    maria.click('[for="checkbox-audio"]');
    maria.sleep(50);
    if (maria.isEnabled('#btnDisponibilizar'))
      assert.fail('#btnDisponibilizar deveria estar desabilitado');

    maria.click('[for="checkbox-video"]');
    maria.sleep(50);
    maria.waitUntil(function(){
      return maria.isEnabled('#btnDisponibilizar');
    }, 30000, '#btnDisponibilizar deveria estar habilitado, verifique permissoes de camera');
    maria.click('[for="checkbox-video"]');
    if (maria.isEnabled('#btnDisponibilizar'))
      assert.fail('#btnDisponibilizar deveria estar desabilitado');

    maria.click('[for="checkbox-texto"]');
    maria.click('[for="checkbox-audio"]');
    maria.click('[for="checkbox-video"]');

    maria.sleep(50);
    if (!maria.isEnabled('#btnDisponibilizar'))
      assert.fail('#btnDisponibilizar deveria estar habilitado');

    maria.click('#btnDisponibilizar');
    maria.wait_text({ '#procurando': 'Esperando que a outra pessoa nos procure' }, 5000)
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 1]);

    maria.click('.btnHome');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (!err)
      console.log('OK')
  });
