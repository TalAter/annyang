//! annyang
//! version : 2.6.1
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://www.TalAter.com/annyang/
(function(root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) { // AMD + global
    define([], function () {
      return (root.annyang = factory(root));
    });
  } else if (typeof module === 'object' && module.exports) { // CommonJS
    module.exports = factory(root);
  } else { // Browser globals
    root.annyang = factory(root);
  }
})(typeof window !== 'undefined' ? window : this, function(root, undefined) {
  'use strict';

  /**
   * # Quick Tutorial, Intro, and Demos
   *
   * The quickest way to get started is to visit the [annyang homepage](https://www.talater.com/annyang/).
   *
   * For a more in-depth look at annyang, read on.
   *
   * # API Reference
   */

  var annyang;

  // Initialize the SpeechRecognition object
  var SpeechRecognition = {};

  // Get the SpeechRecognition object, while handling browser prefixes
  if (!SpeechRecognition) {
    SpeechRecognition = root.SpeechRecognition || root.webkitSpeechRecognition || root.mozSpeechRecognition || root.msSpeechRecognition || root.oSpeechRecognition;
  }

  var commandsList = [];
  var recognition;
  var callbacks = {
    start: [],
    error: [],
    end: [],
    soundstart: [],
    result: [],
    resultMatch: [],
    resultNoMatch: [],
    errorNetwork: [],
    errorPermissionBlocked: [],
    errorPermissionDenied: [],
  };
  var autoRestart;
  var lastStartedAt = 0;
  var autoRestartCount = 0;
  var debugState = false;
  var debugStyle = 'font-weight: bold; color: #00f;';
  var pauseListening = false;
  var isListening = false;

  // The command matching code is a modified version of Backbone.Router by Jeremy Ashkenas, under the MIT license.
  var optionalParam = /\s*\((.*?)\)\s*/g;
  var optionalRegex = /(\(\?:[^)]+\))\?/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[-{}[\]+?.,\\^$|#]/g;
  var commandToRegExp = function(command) {
    command = command
      .replace(escapeRegExp, '\\$&')
      .replace(optionalParam, '(?:$1)?')
      .replace(namedParam, function(match, optional) {
        return optional ? match : '([^\\s]+)';
      })
      .replace(splatParam, '(.*?)')
      .replace(optionalRegex, '\\s*$1?\\s*');
    return new RegExp('^' + command + '$', 'i');
  };

  // This method receives an array of callbacks to iterate over, and invokes each of them
  var invokeCallbacks = function(callbacks, ...args) {
    callbacks.forEach(function(callback) {
      callback.callback.apply(callback.context, args);
    });
  };

  var isInitialized = function() {
    return recognition !== undefined;
  };

  // method for logging in developer console when debug mode is on
  var logMessage = function(text, extraParameters) {
    if (text.indexOf('%c') === -1 && !extraParameters) {
      console.log(text);
    } else {
      console.log(text, extraParameters || debugStyle);
    }
  };

  var initIfNeeded = function() {
    if (!isInitialized()) {
      annyang.init({}, false);
    }
  };

  var registerCommand = function(command, callback, originalPhrase) {
    commandsList.push({ command, callback, originalPhrase });
    if (debugState) {
      logMessage(
        'Command successfully loaded: %c' + originalPhrase,
        debugStyle
      );
    }
  };

  var parseResults = function(results) {
    invokeCallbacks(callbacks.result, results);
    var commandText;
    // go over each of the 5 results and alternative results received (we have set maxAlternatives to 5 above)
    for (let i = 0; i < results.length; i++) {
      // the text recognized
      commandText = results[i].trim();
      if (debugState) {
        logMessage('Speech recognized: %c' + commandText, debugStyle);
      }

      // try and match the recognized text to one of the commands on the list
      for (let j = 0, l = commandsList.length; j < l; j++) {
        var currentCommand = commandsList[j];
        var result = currentCommand.command.exec(commandText);
        if (result) {
          var parameters = result.slice(1);
          if (debugState) {
            logMessage(
              'command matched: %c' + currentCommand.originalPhrase,
              debugStyle
            );
            if (parameters.length) {
              logMessage('with parameters', parameters);
            }
          }
          // execute the matched command
          currentCommand.callback.apply(this, parameters);
          invokeCallbacks(
            callbacks.resultMatch,
            commandText,
            currentCommand.originalPhrase,
            results
          );
          return;
        }
      }
    }
    invokeCallbacks(callbacks.resultNoMatch, results);
  };

  annyang = {
    /**
     * Add commands that annyang will respond to. Similar in syntax to init(), but doesn't remove existing commands.
     *
     * #### Examples:
     * ````javascript
     * const commands = {'hello :name': helloFunction, 'howdy': helloFunction};
     * const commands2 = {'hi': helloFunction};
     *
     * annyang.addCommands(commands);
     * annyang.addCommands(commands2);
     * // annyang will now listen for all three commands
     * ````
     *
     * @param {Object} commands - Commands that annyang should listen for
     * @method addCommands
     * @see [Commands Object](#commands-object)
     */
    addCommands: function(commands) {
      var cb;

      initIfNeeded();

      for (let phrase in commands) {
        if (commands.hasOwnProperty(phrase)) {
          cb = root[commands[phrase]] || commands[phrase];
          if (typeof cb === 'function') {
            // convert command to regex then register the command
            registerCommand(commandToRegExp(phrase), cb, phrase);
          } else if (typeof cb === 'object' && cb.regexp instanceof RegExp) {
            // register the command
            registerCommand(
              new RegExp(cb.regexp.source, 'i'),
              cb.callback,
              phrase
            );
          } else {
            if (debugState) {
              logMessage('Can not register command: %c' + phrase, debugStyle);
            }
            continue;
          }
        }
      }
    },

    /**
     * Start listening.
     * It's a good idea to call this after adding some commands first (but not mandatory)
     *
     * Receives an optional options object which supports the following options:
     *
     * - `autoRestart`  (boolean) Should annyang restart itself if it is closed indirectly, because of silence or window conflicts?
     * - `continuous`   (boolean) Allow forcing continuous mode on or off. Annyang is pretty smart about this, so only set this if you know what you're doing.
     * - `paused`       (boolean) Start annyang in paused mode.
     *
     * #### Examples:
     * ````javascript
     * // Start listening, don't restart automatically
     * annyang.start({ autoRestart: false });
     * // Start listening, don't restart automatically, stop recognition after first phrase recognized
     * annyang.start({ autoRestart: false, continuous: false });
     * ````
     * @param {Object} [options] - Optional options.
     * @method start
     */
    start: function(options) {
      initIfNeeded();
      options = options || {};
      if (options.paused !== undefined) {
        pauseListening = !!options.paused;
      } else {
        pauseListening = false;
      }
      if (options.autoRestart !== undefined) {
        autoRestart = !!options.autoRestart;
      } else {
        autoRestart = true;
      }
      if (options.continuous !== undefined) {
        recognition.continuous = !!options.continuous;
      }

      lastStartedAt = new Date().getTime();
      try {
        recognition.start();
      } catch (e) {
        if (debugState) {
          logMessage(e.message);
        }
      }
    },

    /**
     * Stop listening, and turn off mic.
     *
     * Alternatively, to only temporarily pause annyang responding to commands without stopping the SpeechRecognition engine or closing the mic, use pause() instead.
     * @see [pause()](#pause)
     *
     * @method abort
     */
    abort: function() {
      autoRestart = false;
      autoRestartCount = 0;
      if (isInitialized()) {
        recognition.abort();
      }
    },

    /**
     * Pause listening. annyang will stop responding to commands (until the resume or start methods are called), without turning off the browser's SpeechRecognition engine or the mic.
     *
     * Alternatively, to stop the SpeechRecognition engine and close the mic, use abort() instead.
     * @see [abort()](#abort)
     *
     * @method pause
     */
    pause: function() {
      pauseListening = true;
    },

    /**
     * Resumes listening and restore command callback execution when a command is matched.
     * If SpeechRecognition was aborted (stopped), start it.
     *
     * @method resume
     */
    resume: function() {
      annyang.start();
    },

    /**
     * Turn on the output of debug messages to the console. Ugly, but super-handy!
     *
     * @param {boolean} [newState=true] - Turn on/off debug messages
     * @method debug
     */
    debug: function(newState = true) {
      debugState = !!newState;
    },

    /**
     * Set the language the user will speak in. If this method is not called, defaults to 'en-US'.
     *
     * @param {String} language - The language (locale)
     * @method setLanguage
     * @see [Languages](https://github.com/TalAter/annyang/blob/master/docs/FAQ.md#what-languages-are-supported)
     */
    setLanguage: function(language) {
      initIfNeeded();
      recognition.lang = language;
    },

    /**
     * Remove existing commands. Called with a single phrase, an array of phrases, or methodically. Pass no params to remove all commands.
     *
     * #### Examples:
     * ````javascript
     * const commands = {'hello': helloFunction, 'howdy': helloFunction, 'hi': helloFunction};
     *
     * // Remove all existing commands
     * annyang.removeCommands();
     *
     * // Add some commands
     * annyang.addCommands(commands);
     *
     * // Don't respond to hello
     * annyang.removeCommands('hello');
     *
     * // Don't respond to howdy or hi
     * annyang.removeCommands(['howdy', 'hi']);
     * ````
     * @param {String|Array|Undefined} [commandsToRemove] - Commands to remove
     * @method removeCommands
     */
    removeCommands: function(commandsToRemove) {
      if (commandsToRemove === undefined) {
        commandsList = [];
      } else {
        commandsToRemove = Array.isArray(commandsToRemove) ? commandsToRemove : [commandsToRemove];
        commandsList = commandsList.filter(command => {
          for (let i = 0; i < commandsToRemove.length; i++) {
            if (commandsToRemove[i] === command.originalPhrase) {
              return false;
            }
          }
          return true;
        });
      }
    },

    /**
     * Add a callback function to be called in case one of the following events happens:
     *
     * * `start` - Fired as soon as the browser's Speech Recognition engine starts listening.
     *
     * * `soundstart` - Fired as soon as any sound (possibly speech) has been detected.
     *
     *     This will fire once per Speech Recognition starting. See https://is.gd/annyang_sound_start.
     *
     * * `error` - Fired when the browser's Speech Recognition engine returns an error, this generic error callback will be followed by more accurate error callbacks (both will fire if both are defined).
     *
     *     The Callback function will be called with the error event as the first argument.
     *
     * * `errorNetwork` - Fired when Speech Recognition fails because of a network error.
     *
     *     The Callback function will be called with the error event as the first argument.
     *
     * * `errorPermissionBlocked` - Fired when the browser blocks the permission request to use Speech Recognition.
     *
     *     The Callback function will be called with the error event as the first argument.
     *
     * * `errorPermissionDenied` - Fired when the user blocks the permission request to use Speech Recognition.
     *
     *     The Callback function will be called with the error event as the first argument.
     *
     * * `end` - Fired when the browser's Speech Recognition engine stops.
     *
     * * `result` - Fired as soon as some speech was identified. This generic callback will be followed by either the `resultMatch` or `resultNoMatch` callbacks.
     *
     *     The Callback functions for this event will be called with an array of possible phrases the user said as the first argument.
     *
     * * `resultMatch` - Fired when annyang was able to match between what the user said and a registered command.
     *
     *     The Callback functions for this event will be called with three arguments in the following order:
     *
     *     * The phrase the user said that matched a command.
     *     * The command that was matched.
     *     * An array of possible alternative phrases the user might have said.
     *
     * * `resultNoMatch` - Fired when what the user said didn't match any of the registered commands.
     *
     *     Callback functions for this event will be called with an array of possible phrases the user might have said as the first argument.
     *
     * #### Examples:
     * ````javascript
     * annyang.addCallback('error', function() {
     *   $('.myErrorText').text('There was an error!');
     * });
     *
     * annyang.addCallback('resultMatch', function(userSaid, commandText, phrases) {
     *   console.log(userSaid); // sample output: 'hello'
     *   console.log(commandText); // sample output: 'hello (there)'
     *   console.log(phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
     * });
     *
     * // pass local context to a global function called notConnected
     * annyang.addCallback('errorNetwork', notConnected, this);
     * ````
     * @param {String} type - Name of event that will trigger this callback
     * @param {Function} callback - The function to call when event is triggered
     * @param {Object} [context] - Optional context for the callback function
     * @method addCallback
     */
    addCallback: function(type, callback, context) {
      var cb = root[callback] || callback;
      if (typeof cb === 'function' && callbacks[type] !== undefined) {
        callbacks[type].push({ callback: cb, context: context || this });
      }
    },

    /**
     * Remove callbacks from events.
     *
     * - Pass an event name and a callback command to remove that callback command from that event type.
     * - Pass just an event name to remove all callback commands from that event type.
     * - Pass undefined as event name and a callback command to remove that callback command from all event types.
     * - Pass no params to remove all callback commands from all event types.
     *
     * #### Examples:
     * ````javascript
     * annyang.addCallback('start', myFunction1);
     * annyang.addCallback('start', myFunction2);
     * annyang.addCallback('end', myFunction1);
     * annyang.addCallback('end', myFunction2);
     *
     * // Remove all callbacks from all events:
     * annyang.removeCallback();
     *
     * // Remove all callbacks attached to end event:
     * annyang.removeCallback('end');
     *
     * // Remove myFunction2 from being called on start:
     * annyang.removeCallback('start', myFunction2);
     *
     * // Remove myFunction1 from being called on all events:
     * annyang.removeCallback(undefined, myFunction1);
     * ````
     *
     * @param type Name of event type to remove callback from
     * @param callback The callback function to remove
     * @returns undefined
     * @method removeCallback
     */
    removeCallback: function(type, callback) {
      var compareWithCallbackParameter = function(cb) {
        return cb.callback !== callback;
      };
      // Go over each callback type in callbacks store object
      for (let callbackType in callbacks) {
        if (callbacks.hasOwnProperty(callbackType)) {
          // if this is the type user asked to delete, or he asked to delete all, go ahead.
          if (type === undefined || type === callbackType) {
            // If user asked to delete all callbacks in this type or all types
            if (callback === undefined) {
              callbacks[callbackType] = [];
            } else {
              // Remove all matching callbacks
              callbacks[callbackType] = callbacks[callbackType].filter(compareWithCallbackParameter);
            }
          }
        }
      }
    },

    /**
     * Returns true if speech recognition is currently on.
     * Returns false if speech recognition is off or annyang is paused.
     *
     * @return boolean true = SpeechRecognition is on and annyang is listening
     * @method isListening
     */
    isListening: function() {
      return isListening && !pauseListening;
    },

    /**
     * Returns the instance of the browser's SpeechRecognition object used by annyang.
     * Useful in case you want direct access to the browser's Speech Recognition engine.
     *
     * @returns SpeechRecognition The browser's Speech Recognizer currently used by annyang
     * @method getSpeechRecognizer
     */
    getSpeechRecognizer: function() {
      return recognition;
    },

    /**
     * Simulate speech being recognized. This will trigger the same events and behavior as when the Speech Recognition
     * detects speech.
     *
     * Can accept either a string containing a single sentence or an array containing multiple sentences to be checked
     * in order until one of them matches a command (similar to the way Speech Recognition Alternatives are parsed)
     *
     * #### Examples:
     * ````javascript
     * annyang.trigger('Time for some thrilling heroics');
     * annyang.trigger(
     *     ['Time for some thrilling heroics', 'Time for some thrilling aerobics']
     *   );
     * ````
     *
     * @param string|array sentences A sentence as a string or an array of strings of possible sentences
     * @returns undefined
     * @method trigger
     */
    trigger: function(sentences) {
      if (!annyang.isListening()) {
        if (debugState) {
          if (!isListening) {
            logMessage('Cannot trigger while annyang is aborted');
          } else {
            logMessage('Speech heard, but annyang is paused');
          }
        }
        return;
      }

      if (!Array.isArray(sentences)) {
        sentences = [sentences];
      }

      parseResults(sentences);
    },

    /**
     * Initialize annyang with a list of commands to recognize.
     *
     * #### Examples:
     * ````javascript
     * const commands = {'hello :name': helloFunction};
     * const commands2 = {'hi': helloFunction};
     *
     * // initialize annyang, overwriting any previously added commands
     * annyang.init(commands, true);
     * // adds an additional command without removing the previous commands
     * annyang.init(commands2, false);
     * ````
     * As of v1.1.0 it is no longer required to call init(). Just start() listening whenever you want, and addCommands() whenever, and as often as you like.
     *
     * @param {Object} commands - Commands that annyang should listen to
     * @param {boolean} [resetCommands=true] - Remove all commands before initializing?
     * @method init
     * @deprecated
     * @see [Commands Object](#commands-object)
     */
    init: function(commands, resetCommands = true) {
      // Abort previous instances of recognition already running
      if (recognition && recognition.abort) {
        recognition.abort();
      }

      // initiate SpeechRecognition
      recognition = new SpeechRecognition();

      // Set the max number of alternative transcripts to try and match with a command
      recognition.maxAlternatives = 5;

      // In HTTPS, turn off continuous mode for faster results.
      // In HTTP,  turn on  continuous mode for much slower results, but no repeating security notices
      recognition.continuous = root.location.protocol === 'http:';

      // Sets the language to the default 'en-US'. This can be changed with annyang.setLanguage()
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        isListening = true;
        invokeCallbacks(callbacks.start);
      };

      recognition.onsoundstart = function() {
        invokeCallbacks(callbacks.soundstart);
      };

      recognition.onerror = function(event) {
        invokeCallbacks(callbacks.error, event);
        switch (event.error) {
          case 'network':
            invokeCallbacks(callbacks.errorNetwork, event);
            break;
          case 'not-allowed':
          case 'service-not-allowed':
            // if permission to use the mic is denied, turn off auto-restart
            autoRestart = false;
            // determine if permission was denied by user or automatically.
            if (new Date().getTime() - lastStartedAt < 200) {
              invokeCallbacks(callbacks.errorPermissionBlocked, event);
            } else {
              invokeCallbacks(callbacks.errorPermissionDenied, event);
            }
            break;
        }
      };

      recognition.onend = function() {
        isListening = false;
        invokeCallbacks(callbacks.end);
        // annyang will auto restart if it is closed automatically and not by user action.
        if (autoRestart) {
          // play nicely with the browser, and never restart annyang automatically more than once per second
          var timeSinceLastStart = new Date().getTime() - lastStartedAt;
          autoRestartCount += 1;
          if (autoRestartCount % 10 === 0) {
            if (debugState) {
              logMessage(
                'Speech Recognition is repeatedly stopping and starting. See http://is.gd/annyang_restarts for tips.'
              );
            }
          }
          if (timeSinceLastStart < 1000) {
            setTimeout(function() {
              annyang.start({ paused: pauseListening });
            }, 1000 - timeSinceLastStart);
          } else {
            annyang.start({ paused: pauseListening });
          }
        }
      };

      recognition.onresult = function(event) {
        if (pauseListening) {
          if (debugState) {
            logMessage('Speech heard, but annyang is paused');
          }
          return false;
        }

        // Map the results to an array
        var SpeechRecognitionResult = event.results[event.resultIndex];
        var results = [];
        for (let k = 0; k < SpeechRecognitionResult.length; k++) {
          results[k] = SpeechRecognitionResult[k].transcript;
        }

        parseResults(results);
      };

      // build commands list
      if (resetCommands) {
        commandsList = [];
      }
      if (commands.length) {
        this.addCommands(commands);
      }
    },
  };

  return annyang;
});

/**
 * # Good to Know
 *
 * ## Commands Object
 *
 * Both the [init()]() and addCommands() methods receive a `commands` object.
 *
 * annyang understands commands with `named variables`, `splats`, and `optional words`.
 *
 * * Use `named variables` for one-word arguments in your command.
 * * Use `splats` to capture multi-word text at the end of your command (greedy).
 * * Use `optional words` or phrases to define a part of the command as optional.
 *
 * #### Examples:
 * ````html
 * <script>
 * const commands = {
 *   // annyang will capture anything after a splat (*) and pass it to the function.
 *   // e.g. saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
 *   'show me *tag': showFlickr,
 *
 *   // A named variable is a one-word variable, that can fit anywhere in your command.
 *   // e.g. saying "calculate October stats" will call calculateStats('October');
 *   'calculate :month stats': calculateStats,
 *
 *   // By defining a part of the following command as optional, annyang will respond
 *   // to both: "say hello to my little friend" as well as "say hello friend"
 *   'say hello (to my little) friend': greeting
 * };
 *
 * const showFlickr = function(tag) {
 *   var url = 'http://api.flickr.com/services/rest/?tags='+tag;
 *   $.getJSON(url);
 * }
 *
 * const calculateStats = function(month) {
 *   $('#stats').text('Statistics for '+month);
 * }
 *
 * const greeting = function() {
 *   $('#greeting').text('Hello!');
 * }
 * </script>
 * ````
 *
 * ### Using Regular Expressions in commands
 * For advanced commands, you can pass a regular expression object, instead of
 * a simple string command.
 *
 * This is done by passing an object containing two properties: `regexp`, and
 * `callback` instead of the function.
 *
 * #### Examples:
 * ````javascript
 * const calculateFunction = function(month) { console.log(month); }
 * const commands = {
 *   // This example will accept any word as the "month"
 *   'calculate :month stats': calculateFunction,
 *   // This example will only accept months which are at the start of a quarter
 *   'calculate :quarter stats': {'regexp': /^calculate (January|April|July|October) stats$/, 'callback': calculateFunction}
 * }
 ````
 *
 */
