// annyang
// version : 0.0.1
// author : Tal Ater
// license : GNU v2
// TalAter.com

(function () {
  /*global webkitSpeechRecognition */
  "use strict";

  var root = this;
  var commandsList;
  var recognition;
  var debugState = false;
  var debugStyle = 'font-weight: bold; color: #00f;';

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


  root.annyang = {
    init: function(commands) {

      // initiate webkitSpeechRecognition
      recognition = new webkitSpeechRecognition();
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
          if (debugState) {
            root.console.log('Speech recognized: %c'+commandText, debugStyle);
          }

          for (var j in commandsList) {
            var result = commandsList[j].command.exec(commandText);
            if (result) {
              var parameters = result.slice(1);
              if (debugState) {
                root.console.log('command matched: %c'+commandsList[j].originalPhrase, debugStyle);
                if (parameters.length) {
                  root.console.log('with parameters', parameters);
                }
              }
              commandsList[j].callback.apply(this, parameters);
              return true;
            }
          }
        }
        return false;
      };

      // build commands list
      commandsList = [];
      var cb,
          command;
      for (var phrase in commands) {
        cb = root[commands[phrase]] || commands[phrase];
        if (typeof cb !== 'function') {
          continue;
        }
        //convert command to regex
        command = commandToRegExp(phrase);

        commandsList.push({ command: command, callback: cb, originalPhrase: phrase });
      }
      if (debugState) {
        root.console.log('Commands successfully loaded: %c'+commandsList.length, debugStyle);
      }
    },

    start: function() {
      recognition.start();
    },

    abort: function() {
      recognition.abort();
    },

    debug: function(newState) {
      if (arguments.length > 0) {
        debugState = !!newState;
      } else {
        debugState = true;
      }
    }
  };

}).call(this);
