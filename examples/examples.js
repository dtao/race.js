(function(env) {

  env.runExamples = function(callbacks) {
    var marathon = new Race.Marathon();

    marathon.add(new Race({
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
    }));

    marathon.add(new Race({
      description: 'sum',

      impls: {
        'iterative': function(values) {
          var sum = 0;
          for (var i = 0; i < values.length; ++i) {
            sum += values[i];
          }
          return sum;
        },

        'recursive': function sumRecursive(values, i) {
          i = i || 0;
          if (i >= values.length) {
            return 0;
          }
          return values[i] + sumRecursive(values, i + 1);
        }
      },

      inputs: [
        {
          name: 'Small array',
          values: Race.integers(10),
          size: 10
        },
        {
          name: 'Medium array',
          values: Race.integers(100),
          size: 100
        },
        {
          name: 'Large array',
          values: Race.integers(1000),
          size: 1000
        }
      ]
    }));

    marathon.start(callbacks);

    return marathon;
  };

}(typeof global !== 'undefined' ? global : this));
