(function(env) {

  Benchmark.options.maxTime = 0.5;

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

      inputs: Race.inputs.arraysOfIntegers([10, 100, 1000])
    }));

    marathon.add(new Race({
      description: 'Repeating a character N times',

      impls: {
        'Using str += char': function(char, count) {
          var str = '';
          while (str.length < count) {
            str += char;
          }
          return str;
        },

        'Using str += str': function(char, count) {
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

    marathon.add(new Race({
      description: 'Counting the words in a string',

      impls: {
        'Using String.split': function(str) {
          return str.split(' ').length;
        },

        'Using String.indexOf in a loop': function(str) {
          var start = 0,
              count = 1;

          var wordMark = str.indexOf(' ', start);
          while (wordMark !== -1) {
            ++count;
            start = wordMark + 1;
            wordMark = str.indexOf(' ', start);
          }

          return count;
        },

        'Using /\\b\\w/.exec in a loop': function(str) {
          var wordBreak = /\b\w/g,
              count     = 0;

          while (m = wordBreak.exec(str)) {
            ++count;
          }

          return count;
        }
      },

      inputs: Race.inputs.sentences([10, 100, 1000])
    }));

    marathon.add(new Race({
      description: 'Comparing the contents of two arrays',

      impls: {
        'Inspecting each element one by one': function(arr1, arr2) {
          if (arr1.length !== arr2.length) {
            return false;
          }

          for (var i = 0; i < arr1.length; ++i) {
            if (arr2[i] !== arr1[i]) {
              return false;
            }
          }

          return true;
        },

        'Calling join() and comparing the resulting strings': function(arr1, arr2) {
          return arr1.join(',') === arr2.join(',');
        }
      },

      inputs: Race.inputs.arraysOfIntegers([[10, 10], [100, 100]])
    }));

    marathon.start(callbacks);

    return marathon;
  };

}(typeof global !== 'undefined' ? global : this));
