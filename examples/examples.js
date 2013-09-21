(function(env) {

  env.runExamples = function(callbacks) {
    var marathon = new Race.Marathon();

    marathon.add(new Race({
      description: 'Checking if a string ends with a suffix',

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
      description: 'Summing all the values in an array',

      impls: {
        'Iterative algorithm': function sumIterative(values) {
          var sum = 0;
          for (var i = 0; i < values.length; ++i) {
            sum += values[i];
          }
          return sum;
        },

        'Recursive algorithm': function sumRecursive(values, i) {
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
          values: [Race.integers(10)],
          size: 10
        },
        {
          name: 'Medium array',
          values: [Race.integers(100)],
          size: 100
        },
        {
          name: 'Large array',
          values: [Race.integers(1000)],
          size: 1000
        }
      ]
    }));

    marathon.add(new Race({
      description: 'Repeating a character N times',

      impls: {
        'Appending to the empty string with +=': function(char, count) {
          var str = '';
          while (str.length < count) {
            str += char;
          }
          return str;
        },

        'Doubling the string as many times as possible': function(char, count) {
          var str = char;
          while (str.length <= (count / 2)) {
            str += str;
          }
          if (str.length < count) {
            str += str.substring(0, count - str.length);
          }

          return str;
        }
      },

      inputs: [
        {
          name: 'Small string',
          values: ['a', 10],
          size: 10
        },
        {
          name: 'Medium string',
          values: ['a', 100],
          size: 100
        },
        {
          name: 'Large string',
          values: ['a', 1000],
          size: 1000
        }
      ]
    }));

    marathon.start(callbacks);

    return marathon;
  };

}(typeof global !== 'undefined' ? global : this));
