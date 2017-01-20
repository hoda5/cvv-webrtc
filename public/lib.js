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
          resolve();
        });
      })
    });
  },
  canalOP: function (texto, audio, video) {
    // p.loginOP = new Promise(function (resolve, reject) {
    //   p.boot.then(function () {
    //     firebase.auth().signInAnonymously().catch(trataErro).then(function (user) {
    //       firebase.database().ref('filaOP/' + user.uid).push({
    //         "texto": true,
    //         "audio": true,
    //         "video": true,
    //         "dhFila": new Date()
    //       });
    //       resolve();
    //     });
    //   })
    // });
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