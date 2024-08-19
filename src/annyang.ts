/**
 * # Quick Tutorial, Intro, and Demos
 *
 * The quickest way to get started is to visit the [annyang homepage](https://www.talater.com/annyang/).
 *
 * For a more in-depth look at annyang, read on.
 *
 * # API Reference
 */

let recognition;
let listening = false;
let autoRestart = true;
let debugState = false;
const debugStyle = 'font-weight: bold; color: #00f;';
const commandsList = new Map();
const callbacks = new Map([
  ['start', []],
  ['error', []],
  ['end', []],
  ['soundstart', []],
  ['result', []],
  ['resultMatch', []],
  ['resultNoMatch', []],
  ['errorNetwork', []],
  ['errorPermissionBlocked', []],
  ['errorPermissionDenied', []],
]);
let lastStartedAt = 0;
let autoRestartCount = 0;
let pauseListening = false;

// The command matching code is a modified version of Backbone.Router by Jeremy Ashkenas, under the MIT license.
const optionalParam = /\s*\((.*?)\)\s*/g;
const optionalRegex = /(\(\?:[^)]+\))\?/g;
const namedParam = /(\(\?)?:\w+/g;
const splatParam = /\*\w+/g;
const escapeRegExp = /[-{}[\]+?.,\\^$|#]/g;
const commandToRegExp = command => {
  const parsedCommand = command
    .replace(escapeRegExp, '\\$&')
    .replace(optionalParam, '(?:$1)?')
    .replace(namedParam, (match, optional) => {
      return optional ? match : '([^\\s]+)';
    })
    .replace(splatParam, '(.*?)')
    .replace(optionalRegex, '\\s*$1?\\s*');
  return new RegExp(`^${parsedCommand}$`, 'i');
};

// Get the SpeechRecognition object, accounting for possible browser prefixes
const getSpeechRecognition = () =>
  globalThis.SpeechRecognition ||
  globalThis.webkitSpeechRecognition ||
  globalThis.mozSpeechRecognition ||
  globalThis.msSpeechRecognition ||
  globalThis.oSpeechRecognition;

// Check if annyang is already initialized
const isInitialized = () => {
  return recognition !== undefined;
};

// Method for logging to the console when debug mode is on
const logMessage = (text, extraParameters) => {
  if (debugState) {
    if (text.indexOf('%c') === -1 && !extraParameters) {
      console.log(text);
    } else {
      console.log(text, extraParameters || debugStyle);
    }
  }
};

// Add a command to the commands list
const registerCommand = (command, callback, originalPhrase) => {
  commandsList.set(originalPhrase, { command, callback });
  logMessage(`Command successfully loaded: %c${originalPhrase}`, debugStyle);
};

// This method receives an array of callbacks and invokes each of them
const invokeCallbacks = (callbacksArr, ...args) => {
  callbacksArr.forEach(callback => {
    callback.callback.apply(callback.context, args);
  });
};

// Initialize annyang
const init = () => {
  // Abort previous instances of recognition already running
  if (recognition && recognition.abort) {
    recognition.abort();
  }

  // initiate SpeechRecognition
  recognition = new (getSpeechRecognition())();

  // Set the max number of alternative transcripts to try and match with a command
  recognition.maxAlternatives = 5;

  // In HTTPS, turn off continuous mode for faster results.
  // In HTTP,  turn on  continuous mode for much slower results, but no repeating security notices
  recognition.continuous = globalThis.location.protocol === 'http:';

  // Sets the language to the default 'en-US'. This can be changed with annyang.setLanguage()
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    listening = true;
    invokeCallbacks(callbacks.get('start'));
  };

  recognition.onsoundstart = () => {
    invokeCallbacks(callbacks.get('soundstart'));
  };

  recognition.onerror = event => {
    invokeCallbacks(callbacks.get('error'), event);
    /* eslint-disable-next-line default-case */
    switch (event.error) {
      case 'network':
        invokeCallbacks(callbacks.get('errorNetwork'), event);
        break;
      case 'not-allowed':
      case 'service-not-allowed':
        // if permission to use the mic is denied, turn off auto-restart
        autoRestart = false;
        // determine if permission was denied by user or automatically.
        if (new Date().getTime() - lastStartedAt < 200) {
          invokeCallbacks(callbacks.get('errorPermissionBlocked'), event);
        } else {
          invokeCallbacks(callbacks.get('errorPermissionDenied'), event);
        }
        break;
    }
  };

  recognition.onend = () => {
    listening = false;
    invokeCallbacks(callbacks.get('end'));
    // annyang will auto restart if it is closed automatically and not by user action.
    if (autoRestart) {
      // play nicely with the browser, and never restart annyang automatically more than once per second
      const timeSinceLastStart = new Date().getTime() - lastStartedAt;
      autoRestartCount += 1;
      if (autoRestartCount % 10 === 0) {
        logMessage(
          'Speech Recognition is repeatedly stopping and starting. See http://is.gd/annyang_restarts for tips.'
        );
      }
      if (timeSinceLastStart < 1000) {
        setTimeout(() => {
          start({ paused: pauseListening });
        }, 1000 - timeSinceLastStart);
      } else {
        start({ paused: pauseListening });
      }
    }
  };

  recognition.onresult = event => {
    if (pauseListening) {
      logMessage('Speech heard, but annyang is paused');
      return;
    }

    // Map the results to an array
    const SpeechRecognitionResults = event.results[event.resultIndex];
    const results = Array.from(SpeechRecognitionResults, result => result.transcript);
    parseResults(results);
  };
};

// If annyang isn't initialized, initialize it
const initIfNeeded = () => {
  if (!isInitialized()) {
    init();
  }
};

const parseResults = recognitionResults => {
  const parseCommand = (currentCommand, originalPhrase) => {
    if (commandMatchFound) return;
    const matchedCommand = currentCommand.command.exec(commandText);
    if (matchedCommand) {
      const parameters = matchedCommand.slice(1);
      logMessage(`command matched: %c${originalPhrase}`, debugStyle);
      if (parameters.length) {
        logMessage('with parameters', parameters);
      }
      // execute the matched command
      currentCommand.callback.apply(this, parameters);
      invokeCallbacks(callbacks.get('resultMatch'), commandText, originalPhrase, recognitionResults);
      commandMatchFound = true;
    }
  };
  invokeCallbacks(callbacks.get('result'), recognitionResults);
  let commandText;
  // go over each of the RecognitionResults received (maxAlternatives is set to 5)
  let commandMatchFound = false;
  for (let i = 0; i < recognitionResults.length; i += 1) {
    if (commandMatchFound) return;
    // the text recognized
    commandText = recognitionResults[i].trim();
    logMessage(`Speech recognized: %c${commandText}`, debugStyle);

    // try and match the recognized text to one of the commands on the list
    commandsList.forEach(parseCommand);
  }
  invokeCallbacks(callbacks.get('resultNoMatch'), recognitionResults);
};

/**
 * Is SpeechRecognition supported in this environment?
 *
 * @returns {boolean} true if SpeechRecognition is supported by the browser
 */
const isSpeechRecognitionSupported = () => !!getSpeechRecognition();

/**
 * Add commands that annyang will respond to.
 * By default this will add to the existing commands. Pass `true` as the second parameter to remove all existing commands first.
 *
 * #### Examples:
 * ````javascript
 * const commands1 = {'hello :name': helloFunction, 'howdy': helloFunction};
 * const commands2 = {'hi': helloFunction};
 *
 * annyang.addCommands(commands1);
 * annyang.addCommands(commands2);
 * // annyang will now listen for all three commands defined in commands1 and commands2
 *
 * annyang.addCommands(commands2, true);
 * // annyang will now only listen for the command in commands2
 * ````
 *
 * @param {Object} commands - Commands that annyang should listen for
 * @param {boolean} [resetCommands=false] - Remove all existing commands before adding new commands?
 * @method addCommands
 * @see [Commands Object](#commands-object)
 */
const addCommands = (commands, resetCommands = false) => {
  initIfNeeded();

  if (resetCommands) {
    commandsList.clear();
  }

  Object.keys(commands).forEach(phrase => {
    const cb = globalThis[commands[phrase]] || commands[phrase];
    if (typeof cb === 'function') {
      // convert command to regex then register the command
      registerCommand(commandToRegExp(phrase), cb, phrase);
    } else if (typeof cb === 'object' && cb.regexp instanceof RegExp) {
      // register the command
      registerCommand(new RegExp(cb.regexp.source, 'i'), cb.callback, phrase);
    } else {
      logMessage(`Can not register command: %c${phrase}`, debugStyle);
    }
  });
};

/**
 * Remove existing commands. Called with a single phrase, an array of phrases, or with no params to remove all commands.
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
 * @param {string|string[]|undefined} [commandsToRemove] - Commands to remove
 * @method removeCommands
 */
const removeCommands = commandsToRemove => {
  if (commandsToRemove === undefined) {
    commandsList.clear();
  } else {
    const commandsToRemoveArray = Array.isArray(commandsToRemove) ? commandsToRemove : [commandsToRemove];
    commandsToRemoveArray.forEach(command => commandsList.delete(command));
  }
};

/**
 * Start listening.
 * It's a good idea to call this after adding some commands first (but not mandatory)
 *
 * Receives an optional options object which supports the following options:
 *
 * - `autoRestart`  (boolean) Should annyang restart itself if it is closed indirectly (e.g. because of silence or window conflicts)?
 * - `continuous`   (boolean) Allow forcing continuous mode on or off. annyang is pretty smart about this, so only set this if you know what you're doing.
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
const start = (options = {}) => {
  initIfNeeded();
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
    logMessage(e.message);
  }
};

/**
 * Stop listening and turn off the mic.
 *
 * Alternatively, to only temporarily pause annyang responding to commands without stopping the SpeechRecognition engine or closing the mic, use pause() instead.
 * @see [pause()](#pause)
 *
 * @method abort
 */
const abort = () => {
  autoRestart = false;
  autoRestartCount = 0;
  if (isInitialized()) {
    recognition.abort();
  }
};

/**
 * Pause listening. annyang will stop responding to commands (until the resume or start methods are called), without turning off the browser's SpeechRecognition engine or the mic.
 *
 * Alternatively, to stop the SpeechRecognition engine and close the mic, use abort() instead.
 * @see [abort()](#abort)
 *
 * @method pause
 */
const pause = () => {
  pauseListening = true;
};

/**
 * Resumes listening and restore command callback execution when a command is matched.
 * If SpeechRecognition was aborted (stopped), start it.
 *
 * @method resume
 */
const resume = () => {
  start();
};

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
 * annyang.addCallback('error', () => {
 *   $('.myErrorText').text('There was an error!');
 * });
 *
 * annyang.addCallback('resultMatch', (userSaid, commandText, phrases) => {
 *   console.log(userSaid); // sample output: 'hello'
 *   console.log(commandText); // sample output: 'hello (there)'
 *   console.log(phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
 * });
 *
 * // pass local context to a global function called notConnected
 * annyang.addCallback('errorNetwork', notConnected, this);
 * ````
 * @param {string} type - Name of event that will trigger this callback
 * @param {function} callback - The function to call when event is triggered
 * @param {Object} [context] - Optional context for the callback function
 * @method addCallback
 */
const addCallback = (type, callback, context = undefined) => {
  if (typeof callback === 'function' && callbacks.has(type)) {
    callbacks.get(type).push({ callback, context });
  }
};

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
const removeCallback = (type, callback) => {
  const compareWithCallbackParameter = cb => {
    return cb.callback !== callback;
  };
  // Iterate over each callback type in the callbacks object
  callbacks.forEach((callbacksArray, callbackType) => {
    // if this is the type user asked to delete, or he asked to delete all, go ahead.
    if (type === undefined || type === callbackType) {
      // If user asked to delete all callbacks in this type or all types
      if (callback === undefined) {
        callbacks.get(callbackType).length = 0;
      } else {
        // Remove all matching callbacks
        callbacks.set(callbackType, callbacks.get(callbackType).filter(compareWithCallbackParameter));
      }
    }
  });
};

/**
 * Returns true if speech recognition is currently on.
 * Returns false if speech recognition is off or annyang is paused.
 *
 * @return boolean true = SpeechRecognition is on and annyang is not paused
 * @method isListening
 */
const isListening = () => {
  return listening && !pauseListening;
};

/**
 * Set the language the user will speak in. If this method is not called, annyang defaults to 'en-US'.
 *
 * @param {string} language - The language (locale)
 * @method setLanguage
 * @see [Languages](https://github.com/TalAter/annyang/blob/master/docs/FAQ.md#what-languages-are-supported)
 */
const setLanguage = language => {
  initIfNeeded();
  recognition.lang = language;
};

/**
 * Turn on the output of debug messages to the console.
 *
 * @param {boolean} [newState=true] - Turn debug messages on or off
 * @method debug
 */
const debug = (newState = true) => {
  debugState = !!newState;
};

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
 * @param string|string[] sentences A sentence as a string or an array of strings of possible sentences
 * @returns undefined
 * @method trigger
 */
const trigger = (sentences = []) => {
  if (!isListening()) {
    if (!listening) {
      logMessage('Cannot trigger while annyang is aborted');
    } else {
      logMessage('Speech heard, but annyang is paused');
    }
    return;
  }
  parseResults(Array.isArray(sentences) ? sentences : [sentences]);
};

/**
 * Returns the instance of the browser's SpeechRecognition object used by annyang.
 * Useful in case you want direct access to the browser's Speech Recognition engine.
 *
 * @returns SpeechRecognition The browser's Speech Recognizer instance currently used by annyang
 * @method getSpeechRecognizer
 */
const getSpeechRecognizer = () => {
  return recognition;
};

export {
  isSpeechRecognitionSupported,
  addCommands,
  removeCommands,
  start,
  abort,
  pause,
  resume,
  addCallback,
  removeCallback,
  isListening,
  setLanguage,
  trigger,
  debug,
  getSpeechRecognizer,
};

/**
 * # Good to Know
 *
 * ## Commands Object
 *
 * Both the [init()]() and addCommands() methods receive a `commands` object.
 *
 * annyang understands commands with `named variables`, `splats`, and `optional words`.
 *
 * - Use `named variables` for one-word arguments in your command.
 * - Use `splats` to capture multi-word text at the end of your command (greedy).
 * - Use `optional words` or phrases to define a part of the command as optional.
 *
 * #### Examples:
 * ````html
 * <script>
 * const commands = {
 *   // annyang will capture anything after a splat (*) and pass it to the function.
 *   // For example saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
 *   'show me *tag': showFlickr,
 *
 *   // A named variable is a one-word variable, that can fit anywhere in your command.
 *   // For example saying "calculate October stats" will call calculateStats('October');
 *   'calculate :month stats': calculateStats,
 *
 *   // By defining a part of the following command as optional, annyang will respond
 *   // to both: "say hello to my little friend" as well as "say hello friend"
 *   'say hello (to my little) friend': greeting
 * };
 *
 * const showFlickr = tag => {
 *   const url = 'http://api.flickr.com/services/rest/?tags='+tag;
 *   $.getJSON(url);
 * }
 *
 * const calculateStats = month => {
 *   $('#stats').text('Statistics for '+month);
 * }
 *
 * const greeting = () => {
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
 * const calculateFunction = month => { console.log(month); }
 * const commands = {
 *   // This example will accept any word as the "month"
 *   'calculate :month stats': calculateFunction,
 *   // This example will only accept months which are at the start of a quarter
 *   'calculate :quarter stats': {'regexp': /^calculate (January|April|July|October) stats$/, 'callback': calculateFunction}
 * }
 ````
 *
 */
