/*! annyang v0.2.0 | MIT license | https://www.talater.com/annyang/ */

(function ( window, undefined ) {

  "use strict";

  var annyang;
  var autoRestart;
  var callbacks = {
      end: [],
      error: [],
      result: [],
      resultMatch: [],
      resultNoMatch: [],
      start: []
    };
  var commandsList;
  var debugState = false;
  var lang = 'en-US';
  var recognition;

  // normalize SpeechRecognition
  var SpeechRecognition = window.webkitSpeechRecognition ||
                          window.mozSpeechRecognition ||
                          window.msSpeechRecognition ||
                          window.oSpeechRecognition ||
                          window.SpeechRecognition;

  // The command matching code is a modified version of
  // Backbone.Router by Jeremy Ashkenas, under the MIT license.
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#]/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var optionalParam = /\s*\((.*?)\)\s*/g;
  var optionalRegex = /(\(\?:[^)]+\))\?/g;
  var splatParam    = /\*\w+/g;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  function abort() {
    autoRestart = false;
    recognition.abort();
  }

  function addCallback(type, callback) {
    if ( callbacks[type] !== undefined &&
        typeof cb === 'function' ) {
      callbacks[type].push(callback);
    }
  }

  function addCommands(commands) {

    var phrase;

    for ( phrase in commands ) {
      if ( commands.hasOwnProperty(phrase) &&
          typeof commands[phrase] === 'function') {
        commandsList.push({
          callback: commands[phrase],
          command: commandToRegExp(phrase),
          originalPhrase: phrase
        });
      }
    }

    if ( debugState ) {
      console.log('Commands successfully loaded: ' + commandsList.length);
    }

  }

  function commandToRegExp(command) {
    command = command.replace(escapeRegExp, '\\$&')
                     .replace(optionalParam, '(?:$1)?')
                     .replace(namedParam, function (match, optional) {
                        return optional ? match : '([^\\s]+)';
                      })
                     .replace(splatParam, '(.*?)')
                     .replace(optionalRegex, '\\s*$1?\\s*');
    return new RegExp('^' + command + '$', 'i');
  }


  function debug(newState) {
    debugState = newState === undefined ? true : newState;
    return debugState;
  }

  function init(commands) {

    // abort any previous instances of recognition already running
    if ( recognition ) {
      recognition.abort();
    }

    // initiate
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 5;

    recognition.onend = function () {
      invokeCallbacks(callbacks.end);
      if ( autoRestart ) {
        annyang.start();
      }
    };

    recognition.onerror = function () {
      invokeCallbacks(callbacks.error);
    };

    recognition.onstart = function () {
      invokeCallbacks(callbacks.start);
    };

    recognition.onresult = function (event) {

      var commandText;
      var i = 0;
      var j = 0;
      var parameters;
      var result;
      var results = event.results[event.resultIndex];

      invokeCallbacks(callbacks.result);

      for ( i = 0; i < results.length; i++ ) {
        commandText = results[i].transcript.trim();

        if (debugState) {
          console.log('Speech recognized: ' + commandText);
        }

        for ( j = 0; j < commandsList.length; j++ ) {
          result = commandsList[j].command.exec(commandText);

          if ( result ) {
            parameters = result.slice(1);
            if (debugState) {
              console.log('command matched: ' + commandsList[j].originalPhrase);
              if (parameters.length) {
                console.log(' with parameters ', parameters);
              }
            }
            commandsList[j].callback(parameters);
            invokeCallbacks(callbacks.resultMatch);
            return true;
          }

        }

      }

      invokeCallbacks(callbacks.resultNoMatch);
    };

    // build commands list
    commandsList = [];
    addCommands(commands);
  }

  function invokeCallbacks(callbacks) {
    var j = 0, l = callbacks.length;
    for ( j = 0; j < l; j++ ) {
      callbacks[j]();
    }
  }

  function setLanguage(language) {
    if ( recognition ) {
      recognition.abort();
    }
    recognition.lang = language;
  }

  function start(options) {
    if ( options && options.autoRestart ) {
      autoRestart = !!options.autoRestart;
    } else {
      autoRestart = true;
    }
    recognition.start();
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  // check for browser support
  if ( !SpeechRecognition ) {
    // if there isn't support for SpeechRecognition, there is nothing we can do
    annyang = undefined;

  // if there is support
  } else {

    // create the `annyang` object
    annyang = {
      abort: abort,
      addCallback: addCallback,
      addCommands: addCommands,
      debug: debug,
      init: init,
      setLanguage: setLanguage,
      start: start
    };
  }

  // and expose it to the global object
  window.annyang = annyang;

}( window ));
