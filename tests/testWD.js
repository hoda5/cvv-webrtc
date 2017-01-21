
const assert = require('chai').assert;
const h = require('./h');

h.run(
  {
    personas: ['ana'],
    verbose: true
  },
  function (ana) {
    ana.url('http://www.google.com');
    var s = ana.getTitle();
    assert.equal('Googl1e', s);
  },
  function (err) {
    if (err)
      console.log(err);
    else
      console.log('fim-dos-tests')
  });

