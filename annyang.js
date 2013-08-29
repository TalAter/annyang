// annyang
// version : 0.0.1
// author : Tal Ater
// license : GNU v2
// TalAter.com

(function () {
  /*global webkitSpeechRecognition */
  "use strict";

  var commandsList;
  var root = this;

  // Check browser support
  if (!('webkitSpeechRecognition' in root)) {
    root.annyang = null;
    return null;
  }

  // The command matching code is based on Backbone.Router by Jeremy Ashkenas, under the MIT license.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
  var commandToRegExp = function(command) {
    command = command.replace(escapeRegExp, '\\$&')
                 .replace(optionalParam, '(?:$1)?')
                 .replace(namedParam, function(match, optional) {
                   return optional ? match : '([^\\s]+)';
                 })
                 .replace(splatParam, '(.*?)');
    return new RegExp('^' + command + '$', 'i');
  };

  // initiate webkitSpeechRecognition
  var recognition = new webkitSpeechRecognition();
  recognition.maxAlternatives = 5;
  recognition.continuous = true;
  recognition.lang = "en";

  recognition.onstart   = function()      { };

  recognition.onerror   = function()      { };

  recognition.onend     = function()      { };

  recognition.onresult  = function(event) {
    var results = event.results[event.resultIndex];
    var commandText;
    for (var i = 0; i<results.length; i++) {
      commandText = results[i].transcript.trim();
      window.console.log('recognized: '+commandText);

      for (var j in commandsList) {
        var result = commandsList[j].command.exec(commandText);
        if (result) {
          commandsList[j].callback.apply(this, result.slice(1));
          return true;
        }
      }
    }
    return false;
  };

  root.annyang = {
    init: function(commands) {
      commandsList = [];
      var cb,
          command;
      for (var i in commands) {
        cb = root[commands[i]] || commands[i];
        if (typeof cb !== 'function') {
          continue;
        }
        //convert command to regex
        command = commandToRegExp(i);

        commandsList.push({ command: command, callback: cb });
      }
    },

    start: function() {
      recognition.start();
    }
  };

}).call(this);
