
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

    maria.devtools();
    ana.solicitar_atendimento(true, false, false);
    messias.check_dashboard([1, 0, 0, 1], [0, 0, 0, 0]);

    ana.click('.btnHome');
    maria.click('.btnHome');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (!err)
      console.log('OK')
  });
