window.addEventListener('load', function() {
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
      addChild(resultRow, 'TD', resultGroup.results[result].perf.toFixed(3));
    }
  }

  startExample({
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
});
