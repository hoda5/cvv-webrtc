
const assert = require('chai').assert;
const h = require('./h');

h.run(
  {
    personas: ['maria', 'messias'],
    verbose: true
  },
  function (maria, messias) {
    maria.url(h.domain);
    messias.url(h.domain + '/dashboard.html');
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

    // ana.check_text({
    //   '.checkbox-texto': 'Quero ser atendido(a) por chat',
    //   '.checkbox-audio': 'Quero ser atendido(a) por voz',
    //   '.checkbox-video': 'Quero ser atendido(a) por vídeo',
    //   '#procurando': 'Aguarde alguns instantes que um de nossos voluntários já vai te atender.'
    // });
    // ana.click('.checkbox-texto');
    // messias.check_dashboard([0, 0, 0, 0], [0, 1, 1, 0]);
    // ana.click('.checkbox-audio');
    // messias.check_dashboard([0, 0, 0, 0], [0, 0, 1, 0]);
    // ana.click('.checkbox-texto');
    // messias.check_dashboard([0, 0, 0, 0], [1, 0, 1, 0]);
    // ana.click('.checkbox-video');
    // messias.check_dashboard([0, 0, 0, 0], [1, 0, 0, 0]);
    // ana.click('.checkbox-audio');
    // messias.check_dashboard([0, 0, 0, 0], [1, 1, 0, 0]);
    // ana.click('.checkbox-video');
    // messias.check_dashboard([0, 0, 0, 0], [1, 1, 1, 0]);
    // ana.click('.btnHome');
    // messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 0]);
  },
  function (err) {
    if (err)
      console.log(err);
    else
      console.log('OK')
  });
