//! annyang
//! version : 0.2.0
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://www.TalAter.com/annyang/
(function () {
  "use strict";

  var root = this;
  var SpeechRecognition = root.webkitSpeechRecognition ||
                          root.mozSpeechRecognition ||
                          root.msSpeechRecognition ||
                          root.oSpeechRecognition ||
                          root.SpeechRecognition;
  // Check browser support
  if ( !SpeechRecognition ) {
    root.annyang = null;
    return null;
  }

  var commandsList;
  var recognition;
  var lang = 'en-US';
  var callbacks = { start: [], error: [], end: [], result: [], resultMatch: [], resultNoMatch: [] };
  var autoRestart;
  var debugState = false;
  var debugStyle = 'font-weight: bold; color: #00f;';


  // The command matching code is a modified version of Backbone.Router by Jeremy Ashkenas, under the MIT license.
  var optionalParam = /\s*\((.*?)\)\s*/g;
  var optionalRegex = /(\(\?:[^)]+\))\?/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#]/g;
  var commandToRegExp = function(command) {
    command = command.replace(escapeRegExp, '\\$&')
                  .replace(optionalParam, '(?:$1)?')
                  .replace(namedParam, function(match, optional) {
                    return optional ? match : '([^\\s]+)';
                  })
                  .replace(splatParam, '(.*?)')
                  .replace(optionalRegex, '\\s*$1?\\s*');
    return new RegExp('^' + command + '$', 'i');
  };

  var invokeCallbacks = function(callbacks) {
    for (var j = 0, l = callbacks.length; j < l; j++) {
      callbacks[j].apply(this);
    }
  };

  root.annyang = {
    init: function(commands) {

      // Abort previous instances of recognition already running
      if (recognition && recognition.abort) {
        recognition.abort();
      }

      // initiate
      recognition = new SpeechRecognition();

      recognition.maxAlternatives = 5;
      recognition.continuous = true;
      recognition.lang = lang;

      recognition.onstart   = function()      { invokeCallbacks(callbacks.start); };

      recognition.onerror   = function()      { invokeCallbacks(callbacks.error); };

      recognition.onend     = function() {
        invokeCallbacks(callbacks.end);
        if (autoRestart) {
          root.annyang.start();
        }
      };

      recognition.onresult  = function(event) {
        invokeCallbacks(callbacks.result);
        var results = event.results[event.resultIndex];
        var commandText;
        for (var i = 0; i<results.length; i++) {
          commandText = results[i].transcript.trim();
          if (debugState) {
            root.console.log('Speech recognized: %c'+commandText, debugStyle);
          }

          for (var j = 0, l = commandsList.length; j < l; j++) {
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
              invokeCallbacks(callbacks.resultMatch);
              return true;
            }
          }
        }
        invokeCallbacks(callbacks.resultNoMatch);
        return false;
      };

      // build commands list
      commandsList = [];
      this.addCommands(commands);
    },

    start: function(options) {
      options = options || {};
      if (typeof options.autoRestart !== 'undefined') {
        autoRestart = !!options.autoRestart;
      } else {
        autoRestart = true;
      }
      recognition.start();
    },

    abort: function() {
      autoRestart = false;
      recognition.abort();
    },

    debug: function(newState) {
      if (arguments.length > 0) {
        debugState = !!newState;
      } else {
        debugState = true;
      }
    },

    setLanguage: function(language) {
      lang = language;
      if (recognition && recognition.abort) {
        recognition.lang = language;
      }
    },

    addCommands: function(commands) {
      var cb,
          command;
      for (var phrase in commands) {
        if (commands.hasOwnProperty(phrase)) {
          cb = root[commands[phrase]] || commands[phrase];
          if (typeof cb !== 'function') {
            continue;
          }
          //convert command to regex
          command = commandToRegExp(phrase);

          commandsList.push({ command: command, callback: cb, originalPhrase: phrase });
        }
      }
      if (debugState) {
        root.console.log('Commands successfully loaded: %c'+commandsList.length, debugStyle);
      }
    },

    /**
     * Lets the user add a callback of one of 6 types: start, error, end, result, resultMatch, resultNoMatch
     */
    addCallback: function(type, callback) {
      if (callbacks[type]  === void 0) {
        return;
      }
      var cb = root[callback] || callback;
      if (typeof cb !== 'function') {
        return;
      }
      callbacks[type].push(cb);
    }
  };

}).call(this);
