(function(env) {

  env.startExample = function(callbacks) {
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
        {
          name: 'Positive case',
          values: ['You are my sunshine', 'shine'],
          size: 1
        },
        {
          name: 'Negative case',
          values: ['You are my sunshine', 'rainbow'],
          size: 1
        }
      ]
    });

    race.start(callbacks);
  };

}(typeof global !== 'undefined' ? global : this));
