
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
    maria.wait_text({'.demo-content h5': 'Acesso de voluntários'})
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.click('.btnPassword')
    maria.wait_text({'.demo-content h3': 'Voluntário Teste'}, 5000)
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.click('#btnDisponibilidade');
    maria.wait_text({'.demo-content h5': 'Informe por quais canais você está se disponibilizando a atender'})
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);

    maria.click('#btnDisponibilizar');
    maria.wait_text({'#procurando': 'Esperando que a outra pessoa nos procure'}, 5000)
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 1]);

    maria.click('.btnHome');
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (!err)
      console.log('OK')
  });
