(function(root) {
  if (typeof Benchmark === 'undefined' && typeof require === 'function') {
    Benchmark = root.Benchmark = require('benchmark');
  }

  /**
   * Races multiple implementations of some functionality, ensures they all return the same result,
   * and ranks them by performance.
   *
   * @constructor
   */
  function Race(options) {
    this.description     = options.description;
    this.implementations = options.impls;
    this.inputs          = options.inputs;
    this.comparer        = options.comparer || Race.compare;
  }

  /**
   * Start your engines!
   */
  Race.prototype.start = function(callbacks) {
    var suite            = new Benchmark.Suite(),
        description      = this.description,
        impls            = this.implementations,
        inputs           = this.inputs,
        comparer         = this.comparer,
        implCount        = Object.keys(impls).length,
        results          = [],
        currentResults   = {},
        startCallback    = callbacks.start    || function() {},
        mismatchCallback = callbacks.mismatch || function() {},
        resultCallback   = callbacks.result   || function() {},
        groupCallback    = callbacks.group    || function() {},
        completeCallback = callbacks.complete || function() {};

    startCallback(this);

    forEach(inputs, function(input) {
      input = new Race.Input(input);

      var outputs    = new Race.OutputSet(input, comparer),
          benchmarks = [];

      forIn(impls, function(implName, impl) {
        var output = outputs.add(implName, Race.fastApply(impl, input.values));

        var benchmark = new Benchmark(input.name + ' - ' + implName, function() {
          Race.fastApply(impl, input.values);
        });

        benchmark.race   = description;
        benchmark.impl   = implName;
        benchmark.input  = input;
        benchmark.output = output;

        benchmarks.push(benchmark);
      });

      // If the outputs of all the implementations we just tested did not match,
      // exist early and call the mismatch callback.
      if (!outputs.consistent()) {
        mismatchCallback(outputs);
        return;
      }

      // Otherwise, add all the benchmarks we just created to the suite.
      forEach(benchmarks, function(benchmark) {
        suite.add(benchmark);
      });
    });

    suite.on('cycle', function(e) {
      var benchmark = e.target;

      var result = new Race.Result({
        race:  benchmark.race,
        impl:  benchmark.impl,
        input: benchmark.input,
        perf:  benchmark.hz
      });

      currentResults[benchmark.impl] = result.perf;
      resultCallback(result);

      if (Object.keys(currentResults).length === implCount) {
        (function() {
          var resultGroup = new Race.ResultGroup({
            race:    benchmark.race,
            input:   benchmark.input,
            results: currentResults
          });

          results.push(resultGroup);
          groupCallback(resultGroup);
        }());

        outputs = new Race.OutputSet(comparer);
        currentResults = {};
      }
    });

    suite.on('complete', function() {
      completeCallback(results);
    });

    suite.run({ async: true });
  };

  /**
   * Represents an input that will be passed to multiple implementations in a Race.
   *
   * @constructor
   */
  Race.Input = function(data) {
    this.name   = data.name;
    this.size   = data.size;
    this.values = data.values;
  };

  /**
   * Represents the set of outputs produced by all implementations for a given input.
   *
   * @constructor
   */
  Race.OutputSet = function(input, comparer) {
    this.input      = input;
    this.comparer   = comparer;
    this.outputs    = [];
    this.outputTags = [];
    this.outputMap  = {};
    this.outputTag  = null;
  };

  Race.OutputSet.prototype.add = function(implName, output) {
    var comparer   = this.comparer,
        outputs    = this.outputs,
        outputTags = this.outputTags,
        outputMap  = this.outputMap;

    // Say we've already seen this output 'C' here:
    // [_, _, C, _]
    //
    // Then we will add another 'C' to the tag list:
    // [_, _, C, _, C]
    //
    // Clear as mud? Good.
    for (var i = 0; i < outputs.length; ++i) {
      if (comparer(output, outputs[i])) {
        outputTags.push(outputTags[i]);

        outputMap[implName] = {
          label: outputTags[i],
          value: output
        };

        return outputTags[i];
      }
    }

    outputs.push(output);
    outputTags.push(this.nextOutputTag());

    outputMap[implName] = {
      label: this.outputTag,
      value: output
    };

    return this.outputTag;
  };

  Race.OutputSet.prototype.consistent = function() {
    return this.outputTag === 'A';
  };

  Race.OutputSet.prototype.getOutputMap = function() {
    return this.outputMap;
  };

  Race.OutputSet.prototype.nextOutputTag = function() {
    if (!this.outputTag) {
      this.outputTag = 'A';
    } else {
      this.outputTag = String.fromCharCode(this.outputTag.charCodeAt(0) + 1);
    }

    return this.outputTag;
  };

  /**
   * Represents the result of a single implementation for a given input of a Race.
   *
   * @constructor
   */
  Race.Result = function(data) {
    this.race  = data.race;
    this.impl  = data.impl;
    this.input = data.input;
    this.perf  = data.perf;
  };

  /**
   * Represents the results of all implementations for a given input of a Race.
   *
   * @constructor
   */
  Race.ResultGroup = function(data) {
    this.race    = data.race;
    this.input   = data.input;
    this.results = data.results;
    this.winner  = this.determineWinner();
  };

  Race.ResultGroup.prototype.determineWinner = function() {
    var winner      = null,
        winningPerf = 0,
        runnerUp    = 0;

    forIn(this.results, function(impl, perf) {
      if (perf > winningPerf) {
        winner = impl;
        runnerUp = winningPerf;
        winningPerf = perf;
      } else if (perf > runnerUp) {
        runnerUp = perf;
      }
    });

    return {
      impl: winner,
      margin: (winningPerf - runnerUp) / runnerUp
    };
  };

  /**
   * Runs multiple races consecutively.
   *
   * @constructor
   */
  Race.Marathon = function() {
    this.races = [];
  };

  /**
   * Adds a race to the marathon.
   */
  Race.Marathon.prototype.add = function(race) {
    this.races.push(race);
  };

  /**
   * Starts the first race in the marathon, which will be followed by the next, and so on.
   */
  Race.Marathon.prototype.start = function(callbacks) {
    var races      = this.races,
        allResults = [],
        raceIndex  = 0;

    if (races.length === 0) {
      return;
    }

    var marathonComplete = callbacks.marathonComplete || function() {};

    callbacks = override(callbacks, 'complete', function(complete) {
      return function(results) {
        allResults = allResults.concat(results);

        if (typeof complete === 'function') {
          complete(results);
        }

        var nextRace = races[++raceIndex];

        if (nextRace) {
          nextRace.start(callbacks);

        } else {
          marathonComplete(allResults);
        }
      };
    });

    races[raceIndex].start(callbacks);
  };

  Race.inputs = {
    /**
     * Creates a set of inputs to pass to a Race given a generator function.
     */
    create: function(sizes, generator) {
      if (!sizes || !sizes.length) {
        throw 'Passed a non-array or empty array to Race.inputs.create.';
      }

      var sizingChart = Race.sizingChart(sizes);

      var inputs = [];
      forEach(sizes, function(size) {
        var innerSizes = size instanceof Array ? size : [size];

        inputs.push({
          name: sizingChart[firstValue(size)] + ' ' + generator.inputType,
          values: Race.inputs.createValues(generator, innerSizes),
          size: firstValue(size)
        });
      });

      return inputs;
    },

    /**
     * Creates the arguments to pass an implementation in a Race given a
     * generator function and a collection of array sizes for one input.
     */
    createValues: function(generator, sizes) {
      var values = [];
      forEach(sizes, function(size) {
        values.push(generator(size));
      });
      return values;
    },

    /**
     * Produces a convenient set of inputs to pass to a Race for methods that deal with arrays of
     * integers. Each array of size N will contain the integers from 0 to N - 1.
     */
    arraysOfIntegers: function(sizes) {
      return Race.inputs.create(sizes, Race.utils.integers);
    },

    /**
     * Produces a convenient set of inputs to pass to a Race for methods that deal with arrays of
     * integers. Each array of size N will contain N random integers between 0 and N - 1.
     */
    arraysOfRandomIntegers: function(sizes) {
      return Race.inputs.create(sizes, Race.utils.randomIntegers);
    },

    /**
     * Produces a convenient set of inputs to pass to a Race for methods that deal with strings
     * without any whitespace.
     */
    strings: function(sizes) {
      return Race.inputs.create(sizes, Race.utils.randomWord);
    },

    /**
     * Produces a convenient set of inputs to pass to a Race for methods that deal with arrays of
     * strings without any whitespace.
     */
    arraysOfStrings: function(sizes) {
      return Race.inputs.create(sizes, Race.utils.randomWords);
    },

    /**
     * Produces a convenient set of inputs to pass to a Race for methods that deal with strings
     * comprising multiple words.
     */
    sentences: function(sizes) {
      return Race.inputs.create(sizes, Race.utils.randomSentence);
    }
  };

  Race.utils = {
    /**
     * Produces an array of N integers, starting from a given value (default: 0).
     */
    integers: function(N, start) {
      start = numberOrDefault(start, 0);

      var integers = [];
      for (var i = 0; i < N; ++i) {
        integers.push(start + i);
      }
      return integers;
    },

    /**
     * Produces a random number between min and max (defaults: 0 and 100).
     */
    randomInt: function(min, max) {
      min = numberOrDefault(min, 0);
      max = numberOrDefault(max, 100);

      return Math.floor(min + (Math.random() * (max - min + 1)));
    },

    /**
     * Produces an array of N random integers between min and max (defaults: 0 and 100).
     */
    randomIntegers: function(N, min, max) {
      var randomInt = Race.utils.randomInt,
          integers  = [];
      while (integers.length < N) {
        integers.push(randomInt(min, max));
      };
      return integers;
    },

    /**
     * Produces a random alphabetic character.
     */
    randomLetter: function() {
      var charCodeRange = [
        'a'.charCodeAt(0),
        'z'.charCodeAt(0)
      ];

      return String.fromCharCode(Race.utils.randomInt(charCodeRange[0], charCodeRange[1]));
    },

    /**
     * Produces a random word of length len (default: 10).
     */
    randomWord: function(len) {
      len = numberOrDefault(len, 10);

      var randomLetter = Race.utils.randomLetter,
          word         = '';
      while (word.length < len) {
        word += randomLetter();
      }
      return word;
    },

    /**
     * Produces an array of N random words w/ length between minLength and maxLength
     * (defaults: 3 and 10).
     */
    randomWords: function(N, minLength, maxLength) {
      minLength = numberOrDefault(minLength, 3);
      maxLength = numberOrDefault(maxLength, 3);

      var randomWord = Race.utils.randomWord,
          randomInt  = Race.utils.randomInt,
          words      = [];
      while (words.length < N) {
        words.push(randomWord(randomInt(minLength, maxLength)));
      }
      return words;
    },

    /**
     * Produces a string of N random words.
     */
    randomSentence: function(N) {
      var string = Race.utils.randomWords(N).join(' ');

      // Capitalize the first letter and add a period at the end.
      return string.charAt(0).toUpperCase() + string.substring(1) + '.';
    },

    /**
     * Produces a string of N random sentences (default: 10).
     */
    randomParagraph: function(N) {
      var randomSentence = Race.utils.randomSentence,
          sentences      = [];
      while (sentences.length < N) {
        sentences.push(randomSentence(randomInt(3, 20)));
      }
      return sentences.join(' ');
    },

    /**
     * Formats a number w/ commas as the thousands separator.
     *
     * Note: This totally doesn't belong here, but whatever; it's convenient for now.
     */
    addCommas: function(number) {
      var parts  = String(number).split('.'),
          number = parts.shift(),
          whole  = [];

      while (number.length > 3) {
        whole.unshift(number.substring(number.length - 3));
        number = number.substring(0, number.length - 3);
      }

      if (number.length > 0) {
        whole.unshift(number);
      }

      var result = whole.join(',');

      if (parts.length > 0) {
        result += '.' + parts[0];
      }

      return result;
    }
  };

  Race.utils.integers.inputType = 'array';
  Race.utils.randomIntegers.inputType = 'array';
  Race.utils.randomWord.inputType = 'string';
  Race.utils.randomWords.inputType = 'array';
  Race.utils.randomSentence.inputType = 'string';
  Race.utils.randomParagraph.inputType = 'string';

  /**
   * The default comparison method used to verify outputs from different implementations.
   */
  Race.compare = function(x, y) {
    if (typeof x !== typeof y) {
      return false;
    }

    switch (typeof x) {
      case 'number':
      case 'boolean':
      case 'string':
      case 'function':
        return x === y;

      default:
        if (x instanceof Array) {
          return compareArrays(x, y);
        }

        if (y instanceof Array) {
          // y is an array and x isn't.
          return false;
        }

        if (x instanceof Date) {
          return compareDates(x, y);
        }

        if (y instanceof Date) {
          // y is a date and x isn't.
          return false;
        }

        return compareObjects(x, y);
    }
  };

  /**
   * Accepts an array of sizes (e.g., [1, 2, 3]) and returns an object mapping each size to a
   * friendly name (e.g., 'small', 'large', etc.).
   *
   * Note: mutates (sorts) the input sizes array.
   */
  Race.sizingChart = function(sizes) {
    var chart = {};

    sizes.sort(function(x, y) {
      return x - y;
    });

    if (sizes.length === 2) {
      chart[firstValue(sizes[0])] = 'small';
      chart[firstValue(sizes[1])] = 'large';

    } else {
      var smallSize = Math.floor(sizes.length / 2) - 1;

      if (sizes.length % 2 === 0) {
        smallSize -= 1;
      }

      chart[firstValue(sizes[smallSize])] = 'small';
      chart[firstValue(sizes[smallSize + 1])] = 'medium';
      chart[firstValue(sizes[smallSize + 2])] = 'large';

      for (var i = smallSize - 1, j = smallSize + 3; i >= 0 || j < sizes.length; --i, ++j) {
        if (i >= 0) {
          chart[firstValue(sizes[i])] = 'extra ' + chart[firstValue(sizes[i + 1])];
        }
        if (j < sizes.length) {
          chart[firstValue(sizes[j])] = 'extra ' + chart[firstValue(sizes[j - 1])];
        }
      }
    }

    return chart;
  };

  Race.fastApply = function(fn, args) {
    switch (args.length) {
      case 0:
        return fn();

      case 1:
        return fn(args[0]);

      case 2:
        return fn(args[0], args[1]);

      case 3:
        return fn(args[0], args[1], args[2]);

      case 4:
        return fn(args[0], args[1], args[2], args[3]);

      case 5:
        return fn(args[0], args[1], args[2], args[3], args[4]);

      default:
        return fn.apply(this, args);
    }
  };

  function forEach(collection, fn) {
    for (var i = 0; i < collection.length; ++i) {
      fn(collection[i]);
    }
  }

  function forIn(object, fn) {
    for (var key in object) {
      fn(key, object[key]);
    }
  }

  function firstValue(value) {
    if (!(value instanceof Array)) {
      return value;
    }

    return value[0];
  }

  function compareArrays(arr1, arr2) {
    if (!(arr2 instanceof Array)) {
      return false;
    }

    if (arr1.length !== arr2.length) {
      return false;
    }

    for (var i = 0; i < arr1.length; ++i) {
      if (!Race.compare(arr1[i], arr2[i])) {
        return false;
      }
    }

    return true;
  }

  function compareDates(date1, date2) {
    if (!(date2 instanceof Date)) {
      return false;
    }

    return date1.getTime() === date2.getTime();
  }

  function compareObjects(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }

    for (var key in obj1) {
      if (!Race.compare(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  function override(object, propertyName, replacement) {
    var overridden = clone(object);
    overridden[propertyName] = replacement(object[propertyName]);
    return overridden;
  }

  function clone(object) {
    var cloned = {};
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        cloned[property] = object[property];
      }
    }
    return cloned;
  }

  function numberOrDefault(number, defaultValue) {
    return typeof number === 'number' ? number : defaultValue;
  }

  if (typeof module !== 'undefined') {
    module.exports = Race;

  } else {
    root.Race = Race;
  }

}(this));
