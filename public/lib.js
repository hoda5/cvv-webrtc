
window.qs = function (s) {
  return document.querySelector(s);
}
window.qsa = function (s) {
  return document.querySelectorAll(s);
}

window.cvv = {
  boot: function () {
    if (!p.boot)
      p.boot = new Promise(function (resolve, reject) {
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
    return p.boot;
  },
  internal: { o: {}, v: {} },
  OP: {
    entrar: function () {
      if (cvv.internal.o.uid)
        return Promise.resolve(cvv.internal.o.uid);
      return p.boot.then(function () {

        if (firebase.auth().currentUser)
          return coloca_na_filaOP(firebase.auth().currentUser);

        return firebase.auth().signInAnonymously()
          .then(coloca_na_filaOP)
          .catch(trataErro);

        function coloca_na_filaOP(user) {
          cvv.internal.o.uid = user.uid;
          firebase.database().ref('filaOP/' + user.uid).set({
            "texto": true,
            "audio": true,
            "video": true,
            "dhFila": new Date()
          });
          resolve(user.uid);
        }
      });
    },
    sair: function () {
      return p.boot.then(function () {
        var uid = cvv.internal.o.uid;
        delete cvv.internal.o.uid;
        firebase.database().ref('filaOP/' + uid).remove().then(function () {
          firebase.auth().signOut();
        })
      });
    },
    canal: function (checkbox) {
      var canal = /checkbox\-(.*)$/g.exec(checkbox.id)[1];
      p.canalOP = new Promise(function (resolve, reject) {
        p.loginOP.then(function (uid) {
          var u = {};
          u[canal] = checkbox.checked;
          firebase.database().ref('filaOP/' + uid).update(u);
          resolve();
        })
      });
    },
  },

  loginVoluntario: function (nome) {
    return p.boot.then(function () {
      return firebase.auth().signInAnonymously();
    })
  },
  loginFacebook: function () {
    return p.boot.then(function () {
      return firebase.auth()
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
    });
  },
  loginGoogle: function () {
    return p.boot.then(function () {
      return firebase.auth()
        .signInWithPopup(new firebase.auth.GoogleAuthProvider())
    });
  },
  disponibilizarAtendimento: function () {
    return p.boot.then(function (user) {
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
  }
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

