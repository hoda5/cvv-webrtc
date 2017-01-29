
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

    maria.disponibilizar_atendimento(true, false, false);
    messias.check_dashboard([0, 0, 0, 0], [0, 0, 0, 1]);

    ana.solicitar_atendimento(true, false, false);
    messias.check_dashboard([1, 0, 0, 1], [0, 0, 0, 0]);

    ana.wait_text({ '#a_texto_o': 'Conversa com: Voluntário Teste' }, 5000);
    maria.wait_text({ '#a_texto_v': 'Atendendo por texto' }, 5000);

    ana.waitUntil(function () {
      return !ana.isVisible('#conectando');
    }, 10000);
    maria.waitUntil(function () {
      return !ana.isVisible('#conectando');
    }, 10000);

    ana.chat_envia('Oi');
    ana.chat_check(1, 'Oi', 'you')
    maria.chat_check(1, 'Oi', 'other')

    maria.chat_envia('Olá, como vai você?');
    ana.chat_check(100000, 'Olá, como vai você?', 'other')

    ana.sleep(1000);
    ana.chat_envia('Meu dia está ruim');
    maria.chat_check(2, 'Meu dia está ruim', 'other')

    maria.chat_envia('Seu dia está ruim...');
    ana.chat_check(100001, 'Seu dia está ruim...', 'other')
    ana.sleep(1000);

    maria.chat_envia('Vocẽ gostaria de me contar o que faz o dia dia estar ruim');
    ana.chat_check(100002, 'Vocẽ gostaria de me contar o que faz o dia dia estar ruim', 'other')

    ana.sleep(1000);
    ana.chat_envia('Nem sei por onde começar a falar');
    maria.chat_check(3, 'Nem sei por onde começar a falar', 'other')

    ana.click('.btnSair');
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




