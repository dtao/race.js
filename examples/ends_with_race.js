var Race = require('../race.js');

var race = new Race({
  description: 'endsWith',

  impls: {
    'Using lastIndexOf': function(str, suffix) {
      var targetStart = str.length - suffix.length,
          actualStart = str.lastIndexOf(suffix);
      return actualStart === targetStart;
    },

    'Using substring': function(str, suffix) {
      var actualSuffix = str.substring(str.length - suffix.length);
      return actualSuffix === suffix;
    }
  },

  inputs: [
    ['You are my sunshine', 'shine'],
    ['You are my sunshine', 'rainbow']
  ]
});

race.start();
