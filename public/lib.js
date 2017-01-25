
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
    entrar: function (canais) {
      if (cvv.internal.o.uid)
        return Promise.resolve(cvv.internal.o.uid);
      return cvv.boot().then(function () {

        if (firebase.auth().currentUser)
          return coloca_na_filaOP(firebase.auth().currentUser.uid, canais);

        return firebase.auth().signInAnonymously()
          .then(function (user) {
            return coloca_na_filaOP(user.uid, canais)
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
    canal: function (nome, checked) {
      return cvv.boot().then(function () {
        if (firebase.auth().currentUser) {
          var u = {};
          u[nome] = checked;
          return coloca_na_filaOP(firebase.auth().currentUser.uid, u);
        }
      });
    },
    iniciar_atendimento: function (vuid) {
      return cvv.boot().then(function () {
        setTimeout(function () {
          if (!cvv.internal.o.webrtc)
            firebase.database().ref('atendimento/' + vuid)
              .remove()
              .then(function () {
                location.href = '/index.html';
              })
        }, 30000)
        firebase.database().ref('atendimento/' + vuid).on('value', function (va) {
          var a = va.val();
          var ouid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
          if (a && a.op == ouid) {
            try {
              cvv.internal.o.webrtc = webrtc.join(vuid, ouid, a.canal);
            }
            catch (e) {
              firebase.database().ref('atendimento/' + vuid);
              return errcompat('o.iniciarAtendimento', e);
            }
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
        setTimeout(function () {
          if (!cvv.internal.v.webrtc)
            firebase.database().ref('atendimento/' + vuid)
              .remove()
              .then(function () {
                location.href = '/index.html';
              })
        }, 30000)
        firebase.database().ref('atendimento/' + vuid).on('value', function (va) {
          var a = va.val();
          if (a)
            try {
              cvv.internal.v.webrtc = webrtc.create(vuid, a.op, a.canal);
            }
            catch (e) {
              firebase.database().ref('atendimento/' + vuid);
              return errcompat('v.iniciarAtendimento', e);
            }
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

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var peerOpts = {
  secure: true,
  host: 'hoda5webrtc.herokuapp.com',
  port: 443,
  path: '/',
  debug: 3
};

window.webrtc = {
  delayCreate: 1,
  delayJoin: 5000,
  remote_stream: null,
  tracks: {
    audio: 0,
    video: 0
  },
  onmessage: [],
  send: null,
  create: function (roomId, joinId, canal) {
    setTimeout(function () {
      if (canal == 'texto') {
        webrtc.peer = new Peer(roomId, peerOpts);
        webrtc.peer.on('error', function (err) {
          errcompat('texto.create.peer', err);
        });
        webrtc.peer.on('connection', function (conn) {
          if (conn.label == joinId) {
            var seq = 10000;
            messager.online();
            messager.add('Você já pode conversar com a Outra Pessoa', 'sys');
            conn.on('data', function (data) {
              debugger
              messager.add(data.msg, 'OP', data.seq);
            });
            conn.on('close', function () {
              webrtc_lost()
            });
            conn.on('error', function (err) {
              errcompat('texto.create.conn', err);
            });
            webrtc.send = function (msg) {
              debugger
              if (!msg) return;
              var data = {
                seq: seq++,
                msg: msg
              };
              conn.send(data);
              messager.add(data.msg, 'v', data.seq);
            };
          }
          else conn.close();
        });
      }
      else {
        webrtc_passo1(true, canal == 'video', function () {
          webrtc.peer = new Peer(roomId, peerOpts);

          webrtc.peer.on('call', function (call) {
            call.answer(window.localStream);
            webrtc_passo3(call);
          });
          webrtc.peer.on('error', function (err) {
            // alert(err.message);
            webrtc_passo2();
          });
        });
      }
    }, webrtc.delayCreate);
    return roomId;
  },
  join: function (roomId, myId, canal) {
    if (canal == 'texto') {
      setTimeout(function () {
        webrtc.peer = new Peer(myId, peerOpts);
        var conn = webrtc.peer.connect(roomId, { label: myId });
        conn.on('error', function (err) {
          errcompat('texto.join.conn', err);
        });
        conn.on('open', function () {
          debugger
          var seq = 1;
          messager.online();
          messager.add('O sigilo é muito importante para o CVV, nenhuma mensagem dessa conversa ficará gravada por nós.', 'sys');
          debugger
          conn.on('data', function (data) {
            debugger
            messager.add(data.msg, 'v', data.seq);
          });
          conn.on('close', function () {
            webrtc_lost()
          });
          webrtc.send = function (msg) {
            debugger
            if (!msg) return;
            var data = {
              seq: seq++,
              msg: msg
            };
            conn.send(data);
            messager.add(data.msg, 'OP', data.seq);
          };
        });
      }, webrtc.delayJoin);
    } else {
      webrtc_passo1(true, canal === 'video', function (err) {
        setTimeout(function () {
          webrtc.peer = new Peer(myId, peerOpts);
          try_call();
          function try_call() {
            var call = webrtc.peer.call(roomId, window.localStream);
            if (!call) return setTimeout(try_call, 300);
            webrtc_passo3(call);
            webrtc.peer.on('error', function (err) {
              setTimeout(try_call, 300);
            });
            call.on('close', function () {
              if (webrtc.remote_stream) return webrtc_lost();
              else setTimeout(try_call, 300);
            });
          }
        }, webrtc.delayJoin);
      });
    }
    return roomId;
  },
  close: function () { }
};

function webrtc_passo1(audio, video, callback) {
  console.log('webrtc_passo1');
  qs('#passo1').style.display = 'block';
  qs('#passo3').style.display = 'none';

  setTimeout(function () {
    if (!window.localStream)
      qs('#passo1-erro').style.display = 'block';
  }, 2000);

  navigator.getUserMedia(
    { audio: audio, video: video },
    function (stream) {
      qs('#my-video').setAttribute('src', URL.createObjectURL(stream));
      qs('#my-video').play();
      window.localStream = stream;
      webrtc_passo2();
      if (callback)
        callback();
    }, function () {
      qs('#passo1-erro').style.display = 'block';
      setTimeout(function () {
        webrtc_passo1(audio, video, callback);
      }, 1000);
    });
}

function webrtc_passo2() {
  console.log('webrtc_passo2');
  qs('#passo1').style.display = 'block';
  qs('#passo3').style.display = 'none';
  qs('#passo1-erro').style.display = 'none';
}

function webrtc_passo3(call) {
  console.log('webrtc_passo3');
  if (window.existingCall) {
    window.existingCall.close();
  }
  call.on('error', function (err) {
    errcompat('webrtc_passo3.call', err);
  });

  call.on('stream', function (stream) {
    setTimeout(function () {
      webrtc.remote_stream = stream;
      var audioTracks = stream && stream.getAudioTracks()
      webrtc.tracks.audio = audioTracks ? audioTracks.length : 0;
      var videoTracks = stream && stream.getVideoTracks()
      webrtc.tracks.video = videoTracks ? videoTracks.length : 0;
      setTimeout(function () {
        qs('#their-video').setAttribute('src', URL.createObjectURL(stream));
        setTimeout(function () {
          qs('#their-video').play();
        }, 100);
      }, 100);
    }, 100);
  });

  window.existingCall = call;

  qs('#passo1').style.display = 'none';
  qs('#passo3').style.display = 'block';
}

window.Messager = function (you) {
  var ul;
  qs('#send').addEventListener('click', function () {
    send_input()
  });
  qs('#input').addEventListener('keyup', function (e) {
    if (e.keyCode == 13) {
      send_input();
      return false;
    }
  });

  function send_input() {
    var input = qs('#input');
    webrtc.send(input.value);
    input.value = '';
  }

  return {
    online: function () {
      var e = qs('#conectando');
      e.parentNode.removeChild(e);
      ul = document.createElement('ul');
      ul.classList.add('chatmessages');
      qs('.chat').appendChild(ul);
    },
    add: function (message, who, seq) {
      var li = document.createElement('li');
      li.classList.add(who == you ? 'you' : 'other');

      if (who != 'sys') {
        var a_user = document.createElement('a');
        a_user.classList.add('user');
        a_user.setAttribute('href', '#');

        var img_user = document.createElement('img');
        img_user.setAttribute('src', who == 'OP' ? 'images/person.png' : 'images/cvv.png');
        a_user.appendChild(img_user);
        li.appendChild(a_user);
      }

      var date_div = document.createElement('div');
      date_div.textContent = who=='sys'?'': who == you ? 'Você' : (you == 'OP' ? 'Voluntário Teste' : 'a outra pessoa');
      li.appendChild(date_div);

      var message_div = document.createElement('div');
      message_div.classList.add(who == "sys" ? 'sysmessage' : 'message');
      if (seq)
        message_div.classList.add(['seq', seq].join(''));
      var p_div = document.createElement('p');
      p_div.textContent = message
      message_div.appendChild(p_div);
      li.appendChild(message_div);
      ul.appendChild(li);
      li.scrollIntoView(true);
    }
  };
}

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

function webrtc_lost() {
  setTimeout(function () {
    qs('#demo-container').textContent = 'A conexão foi perdida';
    setTimeout(function () {
      location.href = '/index.html'
    }, 5000)
  }, 5000)
}

function errcompat(id, e) {
  try {
    firebase.database().ref('errcompat').push({
      id: id,
      agent: navigator.userAgent,
      e: e.stack ? e.stack.toString() : e.toString(),
    }).then(function () {
      location.href = '/errcompat.html';
    })
  }
  catch (e2) {
    location.href = '/errcompat.html';
  }
}