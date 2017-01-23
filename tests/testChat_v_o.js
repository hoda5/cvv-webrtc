
const assert = require('chai').assert;
const h = require('./h');

h.run(
  {
    personas: ['maria', 'ana', 'messias'],
    verbose: true
  },
  function (maria, ana, messias) {
    messias.url(h.domain + '/dashboard.html');
    ana.url(h.domain);
    maria.url(h.domain);

    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.disponibilizar_atendimento(true, false, false);
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 1]);

    ana.solicitar_atendimento(true, false, false);
    messias.check_dashboard([1, 0, 0, 1], [0, 0, 0, 0]);

    ana.wait_text({ '#a_texto_o': 'Conversa com: Voluntário Teste' }, 5000);
    maria.wait_text({ '#a_texto_v': 'Atendendo por texto' }, 5000);

    ana.sleep(5000);

    ana.click('.btnHome');
    ana.wait_text({ '#cvvindex': 'Exemplo WebRTC/AppCVV'});

    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
    maria.wait_text({ '#v_disponibilidade': 'Informe por quais canais você está se disponibilizando a atender' }, 5000)

    maria.click('.btnHome');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (!err)
      console.log('OK')
  });
