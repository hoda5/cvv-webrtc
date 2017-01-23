
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

    ana.click('.btnHome');

    maria.wait_text({ '.demo-content h5': 'Informe por quais canais você está se disponibilizando a atender' })
    maria.click('.btnHome');

    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (!err)
      console.log('OK')
  });
