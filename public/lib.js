var p = {};

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
      resolve();
    });
  },
  loginOP: function () {
    p.loginOP = new Promise(function (resolve, reject) {
      p.boot.then(function () {
        firebase.auth().signInAnonymously().catch(trataErro).then(function (user) {
          firebase.database().ref('filaOP/' + user.uid).set({
            "texto": true,
            "audio": true,
            "video": true,
            "dhFila": new Date()
          });
          resolve(user.uid);
        });
      })
    });
  },
  loginFacebook: function () {
    p.loginFacebook = new Promise(function (resolve, reject) {
      p.boot.then(function () {
        var provider = new firebase.auth.FacebookAuthProvider();
        window.cvv.signInWithPopup(resolve, reject, provider);
      })
    });
  },
  loginGoogle: function () {
    p.loginGoogle = new Promise(function (resolve, reject) {
      p.boot.then(function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        window.cvv.signInWithPopup(resolve, reject, provider);
      })
    });
  },
  usuarioLogado: function () {
    return p.boot.then(function () {
      return firebase.auth().currentUser;
    });
  },
  logout: function () {
    return p.boot.then(function () {
      firebase.auth().signOut().then(function () {

      });
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

function signInWithPopup(resolve, reject, provider) {
  firebase.auth().signInWithPopup(provider).then(function (result) {
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
    window.location.href = "/logado.html";
    resolve(user);
    // ...
  }).catch(function (error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    reject(errorMessage);
    // ...
  });
},
