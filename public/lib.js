
window.qs = function (s) {
  return document.querySelector(s);
}
window.qsa = function (s) {
  return document.querySelectorAll(s);
}

window.cvv = {
  internal: { o: {}, v: {}, d: {}, st: new Date().getTime() },
  boot: function () {
    if (!cvv.internal.boot)
      cvv.internal.boot = new Promise(function (resolve, reject) {
        var config = {
          apiKey: "AIzaSyDfaFK-b45-NlueU--RNUYTRqJV9w2wzyg",
          authDomain: "i-cvv-hoda5.firebaseapp.com",
          databaseURL: "https://i-cvv-hoda5.firebaseio.com",
          storageBucket: "i-cvv-hoda5.appspot.com",
          messagingSenderId: "912825779427"
        };
        firebase.initializeApp(config);

        var unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
          if (user) {
            resolve(user);
            unsubscribe();
          }
        });

        setTimeout(function () {
          resolve();
          unsubscribe();
        }, 1000);
      });
    return cvv.internal.boot;
  },
  OP: {
    entrar: function () {
      if (cvv.internal.o.uid)
        return Promise.resolve(cvv.internal.o.uid);
      return cvv.boot().then(function () {

        if (firebase.auth().currentUser)
          return coloca_na_filaOP(firebase.auth().currentUser.uid, {});

        return firebase.auth().signInAnonymously()
          .then(function (user) {
            return coloca_na_filaOP(user.uid, {})
          })
          .catch(trataErro);
      });
    },
    sair: function () {
      return cvv.boot().then(function () {
        var uid = cvv.internal.o.uid;
        delete cvv.internal.o.uid;
        firebase.database().ref('filaOP/' + uid).remove().then(function () {
          firebase.auth().signOut();
        })
      });
    },
    canal: function (checkbox) {
      var canal = /checkbox\-(.*)$/g.exec(checkbox.id)[1];
      return cvv.boot().then(function () {
        if (firebase.auth().currentUser) {
          var u = {};
          u[canal] = checkbox.checked;
          return coloca_na_filaOP(firebase.auth().currentUser.uid, u);
        }
      });
    },
    iniciar_atendimento: function (vuid) {
      return cvv.boot().then(function () {
        firebase.database().ref('atendimento/' + vuid).on('value', function (va) {
          var a = va.val();
          var ouid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
          if (a && a.op == ouid) {
            cvv.internal.o.webrtc = webrtc.join(vuid, ouid, a.canal);
          }
          else if (cvv.internal.st < new Date().getTime() - 5000)
            location.href = '/index.html';
        });
      });
    },
    finalizar_atendimento: function () {
      debugger
      if (cvv.internal.o.webrtc) {
        webrtc.close();
        firebase.database().ref('atendimento/' + cvv.internal.o.webrtc).remove().then(function () {
          location.href = '/index.html';
        });
      }
    }
  },
  voluntario: {
    login: function (nome, senha) {
      return cvv.boot().then(function () {
        return firebase.auth().signInAnonymously();
      })
    },
    loginFacebook: function () {
      return cvv.boot().then(function () {
        return firebase.auth()
          .signInWithPopup(new firebase.auth.FacebookAuthProvider())
      });
    },
    loginGoogle: function () {
      return cvv.boot().then(function () {
        return firebase.auth()
          .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      });
    },
    disponibilizarAtendimento: function () {
      return cvv.boot().then(function (user) {
        return firebase.database().ref('filaVoluntario/' + user.uid).set({
          "nome": 'Voluntário Teste',
          "texto": qs('#checkbox-texto').checked,
          "audio": qs('#checkbox-audio').checked,
          "video": qs('#checkbox-video').checked
        });
      });
    },
    retirarDisponibilidade: function (uid) {
      return firebase.database().ref('filaVoluntario/' + uid).remove();
    },
    esperar: function (fn) {
      var filaVoluntario = {};
      return cvv.boot().then(function () {
        var vuid = firebase.auth().currentUser.uid;
        firebase.database().ref('filaVoluntario/' + vuid).on('value', function (v) {
          filaVoluntario = v.val() || {};
        });
        firebase.database().ref('filaOP').on('value', function (v) {
          if (!cvv.internal.v.conectando) {
            var toda_filaOP = v.val();
            if (toda_filaOP)
              Object.keys(toda_filaOP).some(function (ouid) {
                var filaOP = toda_filaOP[ouid];
                if (!filaOP.conectando) {
                  var canal;
                  if (filaOP.texto && filaVoluntario.texto) canal = 'texto';
                  if (filaOP.audio && filaVoluntario.audio) canal = 'audio';
                  if (filaOP.video && filaVoluntario.video) canal = 'video';
                  if (canal) {
                    cvv.voluntario.iniciar_conexao(vuid, ouid, canal);
                    return true;
                  }
                }
              })
          }
        });
        firebase.database().ref('atendimento/' + vuid).on('value', function (val) {
          var a = val.val();
          if (a)
            fn(a);
        });
      });
    },
    iniciar_conexao: function (vuid, ouid, canal) {
      cvv.internal.v.conectando = {
        OP: ouid,
        canal: canal,
        ts: new Date().getTime()
      };
      return firebase.database().ref('filaOP/' + ouid).transaction(function (o) {
        if (o && !o.conectando) {
          o.conectando = {
            voluntario: vuid,
            canal: canal
          };
          return o;
        }
      });
      // TODO cancelar conexao
    },
    iniciar_atendimento: function () {
      return cvv.boot().then(function (ouid) {
        var vuid = firebase.auth().currentUser.uid;
        firebase.database().ref('atendimento/' + vuid).on('value', function (va) {
          var a = va.val();
          if (a) cvv.internal.v.webrtc = webrtc.create(vuid, a.op, a.canal);
          else if (cvv.internal.st < new Date().getTime() - 5000)
            location.href = '/v-disponibilidade.html';
        });
      });
    },
    finalizar_atendimento: function () {
      debugger
      if (cvv.internal.v.webrtc) {
        webrtc.close();
        firebase.database().ref('atendimento/' + cvv.internal.v.webrtc).remove().then(function () {
          location.href = '/v-disponibilidade.html';
        }).then(function () {
          location.href = '/v-disponibilidade.html';
        });
      }
    }
  },
  dashboard: {
    update: function () {
      if (cvv.internal.d.on && cvv.internal.d.s)
        cvv.internal.d.on(cvv.internal.d.s);
    },
    on: function (fn) {
      cvv.internal.d.s = {
        texto: { a: 0, f: 0 },
        audio: { a: 0, f: 0 },
        video: { a: 0, f: 0 },
        voluntarios: { a: 0, f: 0 }
      };
      cvv.internal.d.on = fn;
      cvv.boot().then(function () {

        firebase.database().ref('filaOP').on('value', function (v) {
          var filaOP = v.val();
          cvv.internal.d.s.texto.f = 0;
          cvv.internal.d.s.audio.f = 0;
          cvv.internal.d.s.video.f = 0;
          if (filaOP)
            Object.keys(filaOP).forEach(function (uid) {
              var op = filaOP[uid];
              if (op.texto) cvv.internal.d.s.texto.f++;
              if (op.audio) cvv.internal.d.s.audio.f++;
              if (op.video) cvv.internal.d.s.video.f++;
            });
          cvv.dashboard.update();
        });

        firebase.database().ref('filaVoluntario').on('value', function (v) {
          var filaVoluntario = v.val();
          if (filaVoluntario)
            cvv.internal.d.s.voluntarios.f = Object.keys(filaVoluntario).length;
          else
            cvv.internal.d.s.voluntarios.f = 0;
          cvv.dashboard.update();
        });

        firebase.database().ref('atendimento').on('value', function (v) {
          var atendimentos = v.val();
          cvv.internal.d.s.texto.a = 0;
          cvv.internal.d.s.audio.a = 0;
          cvv.internal.d.s.video.a = 0;
          cvv.internal.d.s.voluntarios.a = 0;
          if (atendimentos)
            Object.keys(atendimentos).forEach(function (vuid) {
              var a = atendimentos[vuid];
              if (a.canal == 'texto') cvv.internal.d.s.texto.a++;
              if (a.canal == 'audio') cvv.internal.d.s.audio.a++;
              if (a.canal == 'video') cvv.internal.d.s.video.a++;
              cvv.internal.d.s.voluntarios.a++;
            });
          cvv.dashboard.update();
        });
      });
    }
  }
}

window.webrtc = {
  onmessage: [],
  send: null,
  create: function (roomId, joinId) {
    webrtc.peer = new Peer(roomId, { key: 'vfanh8qxv5oh6w29' });
    webrtc.peer.on('connection', function (conn) {
      debugger
      if (conn.label == joinId) {
        conn.on('data', function (data) {
          webrtc.onmessage.forEach(function (e) {
            e(data);
          });
        });
        webrtc.send = function () {
          conn.send.apply(conn, Array.slice.prototype.call(arguments));
        };
      }
      else conn.close();
    });
    return roomId;
  },
  join: function (roomId, myId, canal) {
    webrtc.peer = new Peer(null, { key: 'vfanh8qxv5oh6w29' });
    debugger
    var conn = peer.connect(roomId, { label: myId });
    conn.on('open', function () {
      debugger
      conn.on('data', function (data) {
        webrtc.onmessage.forEach(function (e) {
          e(data);
        });
      });
      webrtc.send = function () {
        conn.send.apply(conn, Array.slice.prototype.call(arguments));
      };
    });
    return roomId;
  },
  close: function () { }
};

cvv.boot();

function trataErro(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;

  if (errorCode === 'auth/operation-not-allowed') {
    alert('You must enable Anonymous auth in the Firebase Console.');
  } else {
    console.error(error);
  }
}

function coloca_na_filaOP(uid, opts) {
  cvv.internal.o.uid = uid;
  var ref = firebase.database().ref('filaOP/' + uid);
  ref.transaction(function (o) {
    o = o || {};
    if (typeof opts.texto === 'boolean')
      o.texto = opts.texto;
    else if (typeof o.texto !== 'boolean')
      o.texto = true;
    if (typeof opts.audio === 'boolean')
      o.audio = opts.audio;
    else if (typeof o.audio !== 'boolean')
      o.audio = true;
    if (typeof opts.video === 'boolean')
      o.video = opts.video;
    else if (typeof o.video !== 'boolean')
      o.video = true;
    o.dhFila = o.dhFila || new Date().getTime();
    return o;
  })
    .then(function () {
      return uid;
    });
  ref.on('value', function (v) {
    var filaOP = v.val();
    if (filaOP && filaOP.conectando) {
      firebase.database()
        .ref('atendimento/' + filaOP.conectando.voluntario)
        .transaction(function (a) {
          if (a) cvv.OP.abortar_conexao();
          return {
            "op": uid,
            "canal": filaOP.conectando.canal,
            "inicio": new Date().getTime(),
            "dhFila": filaOP.dhFila
          };
        }).then(function () {
          return ref.remove();
        }).then(function () {
          firebase.database().ref('filaVoluntario/' + filaOP.conectando.voluntario).remove();
        }).then(function () {
          location.href = ['/a-', filaOP.conectando.canal, '-o.html#', filaOP.conectando.voluntario].join('');
        });
    }
  });
  return uid;
}

