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
      input: ['You are my sunshine', 'shine'],
      size: 1
    },
    {
      name: 'Negative case',
      input: ['You are my sunshine', 'rainbow'],
      size: 1
    }
  ]
});

race.start({
  result: function(resultGroup) {
    var resultsTable = document.getElementById('results-table');

    // For the very first result, populate column headers.
    if (resultsTable.children.length === 0) {
      addColumnHeaders(resultsTable, Object.keys(resultGroup.results));
    }

    addResultRow(resultsTable, resultGroup);
  },

  complete: function(results) {
    var loadingIcon = document.getElementById('loading-icon');
    loadingIcon.parentNode.removeChild(loadingIcon);
  }
});

function addChild(element, childName, content) {
  var child = document.createElement(childName);
  element.appendChild(child);
  if (content) {
    child.textContent = content;
  }
  return child;
}

function addColumnHeaders(table, headers) {
  var headerRow = addChild(table, 'TR');

  addChild(headerRow, 'TH', 'Input');
  for (var i = 0; i < headers.length; ++i) {
    addChild(headerRow, 'TH', headers[i]);
  }
}

function addResultRow(table, resultGroup) {
  var resultRow = addChild(table, 'TR');
  addChild(resultRow, 'TD', resultGroup.input.name);
  for (var result in resultGroup.results) {
    addChild(resultRow, 'TD', resultGroup.results[result].perf);
  }
}
