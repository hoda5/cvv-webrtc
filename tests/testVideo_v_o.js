
const assert = require('chai').assert;
const h = require('./h');

h.run(
  {
    personas: ['maria', 'ana', 'messias'],
    verbose: false
  },
  function (maria, ana, messias) {
    messias.url(h.domain + '/dashboard.html');
    messias.execute('document.body.style.zoom="70%"');
    ana.url(h.domain);
    maria.url(h.domain);

    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.disponibilizar_atendimento(false, true, false);
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 1]);

    ana.solicitar_atendimento(false, true, false);
    messias.check_dashboard([0, 1, 0, 1], [0, 0, 0, 0]);

    ana.wait_text({ '#a_video_o': 'Atendimento por voz' }, 5000);
    maria.wait_text({ '#a_video_v': 'Atendimento por voz' }, 5000);

    ana.waitUntil(function () {
      return !ana.isVisible('#conectando');
    }, 10000);
    maria.waitUntil(function () {
      return !ana.isVisible('#conectando');
    }, 10000);

    ana.sleep(5000);

    ana.wait_text({
      '#conectado_o': 'Você está falando com o(a) voluntário(a):',
      '#nome-voluntario': 'Voluntário Teste'
    }, 5000);

    maria.wait_text({
      '#conectado_v': 'Você está em atendimento'
    }, 5000);


    ana.click('#sairLigacao');
    ana.wait_text({ '#cvvindex': 'Exemplo WebRTC/AppCVV' });

    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
    maria.wait_text({ '#v_disponibilidade': 'Informe por quais canais você está se disponibilizando a atender' }, 5000)

    maria.click('.btnHome');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (!err)
      console.log('OK')
  });
