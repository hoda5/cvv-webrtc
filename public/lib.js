
var p = {};

window.qs = function(s) {
  return document.querySelector(s);
}

window.cvv = {
  boot: function () {
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
          resolve();
          unsubscribe();
        }
      });

      setTimeout(function () {
        resolve();
        unsubscribe();
      }, 10000);
    });
  },
  loginOP: function () {
    p.loginOP = new Promise(function (resolve, reject) {
      p.boot.then(function () {
        if (firebase.auth().currentUser) {
          coloca_na_filaOP(firebase.auth().currentUser);
        }
        else
          firebase.auth().signInAnonymously()
            .then(coloca_na_filaOP)
            .catch(trataErro);

        function coloca_na_filaOP(user) {
          firebase.database().ref('filaOP/' + user.uid).set({
            "texto": true,
            "audio": true,
            "video": true,
            "dhFila": new Date()
          });
          resolve(user.uid);
        }
      })
    });
  },
  canalOP: function (checkbox) {
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
  loginVoluntario: function (nome) {
    p.loginVoluntario = new Promise(function (resolve, reject) {
      p.boot.then(function () {
        if (firebase.auth().currentUser) {
          coloca_na_filaOP(firebase.auth().currentUser);
        }
        else
          firebase.auth().signInAnonymously()
            .then(coloca_na_filaOP)
            .catch(trataErro);

        function coloca_na_filaOP(user) {
          firebase.database().ref('filaVoluntario/' + user.uid).set({
            "nome": nome,
            "texto": true,
            "audio": true,
            "video": true
          });
          resolve(user.uid);
        }
      })
    });
  },
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