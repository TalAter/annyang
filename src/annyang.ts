const MIN_RESTART_INTERVAL_MS = 1000;
const RESTART_WARNING_INTERVAL = 10;

let recognition: SpeechRecognition;
let listening: boolean = false;
let autoRestart: boolean = true;
let debugState: boolean = false;
const debugStyle: string = 'font-weight: bold; color: #00f;';

export interface CallbackMap {
  start: () => void;
  end: () => void;
  soundstart: () => void;
  result: (phrases: string[]) => void;
  resultMatch: (userSaid: string, commandText: string, phrases: string[]) => void;
  resultNoMatch: (phrases: string[]) => void;
  error: (event: SpeechRecognitionErrorEvent) => void;
  errorNetwork: (event: SpeechRecognitionErrorEvent) => void;
  errorPermissionBlocked: (event: SpeechRecognitionErrorEvent) => void;
  errorPermissionDenied: (event: SpeechRecognitionErrorEvent) => void;
}

export type CallbackType = keyof CallbackMap;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => void;

interface StoredCallback {
  callback: AnyFunction;
  context: object | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const commandsList: Map<string, { command: RegExp; callback: (...args: any[]) => void }> = new Map();
const callbacks: Map<CallbackType, StoredCallback[]> = new Map([
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
let lastStartedAt: number = 0;
let autoRestartCount: number = 0;
let pauseListening: boolean = false;

// The command matching code is a modified version of Backbone.Router by Jeremy Ashkenas, under the MIT license.
const optionalParam = /\s*\((.*?)\)\s*/g;
const optionalRegex = /(\(\?:[^)]+\))\?/g;
const namedParam = /(\(\?)?:\w+/g;
const splatParam = /\*\w+/g;
const escapeRegExp = /[-{}[\]+?.,\\^$|#]/g;
const commandToRegExp = (command: string) => {
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
const getSpeechRecognition = () => globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

// Check if annyang is already initialized
const isInitialized = () => {
  return recognition !== undefined;
};

// Method for logging to the console when debug mode is on
const logMessage = (text: string, extraParameters?: string | string[]) => {
  if (debugState) {
    if (text.indexOf('%c') === -1 && !extraParameters) {
      console.log(text);
    } else {
      console.log(text, extraParameters || debugStyle);
    }
  }
};

// Add a command to the commands list
const registerCommand = (command: RegExp, callback: AnyFunction, originalPhrase: string) => {
  commandsList.set(originalPhrase, { command, callback });
  logMessage(`Command successfully loaded: %c${originalPhrase}`, debugStyle);
};

// This method receives an array of callbacks and invokes each of them
const invokeCallbacks = (callbacksArr: StoredCallback[] = [], ...args: unknown[]) => {
  callbacksArr.forEach(cb => {
    cb.callback.apply(cb.context, args);
  });
};

// Initialize annyang
const init = () => {
  if (!getSpeechRecognition()) {
    return;
  }

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
      default:
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
      if (autoRestartCount % RESTART_WARNING_INTERVAL === 0) {
        logMessage(
          'Speech Recognition is repeatedly stopping and starting. See http://is.gd/annyang_restarts for tips.'
        );
      }
      if (timeSinceLastStart < MIN_RESTART_INTERVAL_MS) {
        setTimeout(() => {
          start({ paused: pauseListening });
        }, MIN_RESTART_INTERVAL_MS - timeSinceLastStart);
      } else {
        start({ paused: pauseListening });
      }
    }
  };

  recognition.onresult = (event: SpeechRecognitionEvent) => {
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

const parseResults = (recognitionResults: string[]) => {
  invokeCallbacks(callbacks.get('result'), recognitionResults);

  // Log all recognition alternatives for debugging, regardless of match
  for (const rawText of recognitionResults) {
    logMessage(`Speech recognized: %c${rawText.trim()}`, debugStyle);
  }

  // Try to match each alternative to a command
  for (const rawText of recognitionResults) {
    const commandText = rawText.trim();
    for (const [originalPhrase, currentCommand] of commandsList) {
      const matchedCommand = currentCommand.command.exec(commandText);
      if (matchedCommand) {
        const parameters = matchedCommand.slice(1);
        logMessage(`command matched: %c${originalPhrase}`, debugStyle);
        if (parameters.length) {
          logMessage('with parameters', parameters);
        }
        currentCommand.callback(...parameters);
        invokeCallbacks(callbacks.get('resultMatch'), commandText, originalPhrase, recognitionResults);
        return;
      }
    }
  }
  invokeCallbacks(callbacks.get('resultNoMatch'), recognitionResults);
};

/**
 * Is SpeechRecognition supported in this environment?
 *
 * @returns {boolean} true if SpeechRecognition is supported by the browser
 */
const isSpeechRecognitionSupported = () => !!getSpeechRecognition();

export type CommandCallback = (...args: string[]) => void;

export interface CommandsList {
  [key: string]:
    | CommandCallback
    | {
        regexp: RegExp;
        callback: CommandCallback;
      };
}

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
 * @param {boolean} [resetCommands=false] - Remove all existing commands before adding new commands? * @see [Commands Object](#commands-object)
 */
const addCommands = (commands: CommandsList, resetCommands = false) => {
  if (resetCommands) {
    commandsList.clear();
  }

  for (const phrase of Object.keys(commands)) {
    const cb = commands[phrase];

    if (typeof cb === 'function') {
      // convert command to regex then register the command
      registerCommand(commandToRegExp(phrase), cb, phrase);
    } else if (typeof cb === 'object' && cb.regexp instanceof RegExp) {
      // register the command
      registerCommand(new RegExp(cb.regexp.source, 'i'), cb.callback, phrase);
    } else {
      logMessage(`Can not register command: %c${phrase}`, debugStyle);
    }
  }
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
 */
const removeCommands = (commandsToRemove?: string | string[] | undefined) => {
  if (commandsToRemove === undefined) {
    commandsList.clear();
  } else {
    const commandsToRemoveArray = Array.isArray(commandsToRemove) ? commandsToRemove : [commandsToRemove];
    commandsToRemoveArray.forEach(command => commandsList.delete(command));
  }
};

export interface StartOptions {
  autoRestart?: boolean;
  continuous?: boolean;
  paused?: boolean;
}

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
 */
const start = (options: StartOptions = {}) => {
  if (!isSpeechRecognitionSupported()) {
    return;
  }
  initIfNeeded();
  pauseListening = !!options.paused;
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
  } catch (e: unknown) {
    logMessage(e instanceof Error ? e.message : String(e));
  }
};

/**
 * Stop listening and turn off the mic.
 *
 * Alternatively, to only temporarily pause annyang responding to commands without stopping the SpeechRecognition engine or closing the mic, use pause() instead.
 * @see [pause()](#pause)
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
 */
const pause = () => {
  pauseListening = true;
};

/**
 * Resumes listening and restore command callback execution when a command is matched.
 * If SpeechRecognition was aborted (stopped), start it.
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
 * annyang.addCallback('resultMatch', (userSaid, commandText, phrases) => {
 *   console.log(userSaid); // sample output: 'hello'
 *   console.log(commandText); // sample output: 'hello (there)'
 *   console.log(phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
 * });
 *
 * // Returns an unsubscribe function
 * const unsubscribe = annyang.addCallback('error', () => {
 *   console.log('There was an error!');
 * });
 * unsubscribe(); // removes the callback
 * ````
 * @param {string} type - Name of event that will trigger this callback
 * @param {function} callback - The function to call when event is triggered
 * @param {Object} [context] - Optional context for the callback function
 * @returns {function} A function that removes this callback when called
 */
const addCallback = <T extends CallbackType>(
  type: T,
  callback: CallbackMap[T],
  context: object | undefined = undefined
): (() => void) => {
  const callbacksOfType = callbacks.get(type);
  if (typeof callback === 'function' && callbacksOfType) {
    const entry: StoredCallback = {
      callback: callback as AnyFunction,
      context,
    };
    callbacksOfType.push(entry);
    return () => {
      const arr = callbacks.get(type);
      if (arr) {
        const idx = arr.indexOf(entry);
        if (idx !== -1) arr.splice(idx, 1);
      }
    };
  }
  return () => {};
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
 */
const removeCallback = (type?: CallbackType, callback?: CallbackMap[CallbackType]) => {
  callbacks.forEach((callbacksArray, callbackType) => {
    if (type === undefined || type === callbackType) {
      if (callback === undefined) {
        callbacks.get(callbackType)!.length = 0;
      } else {
        callbacks.set(
          callbackType,
          callbacksArray.filter(cb => cb.callback !== callback)
        );
      }
    }
  });
};

/**
 * Returns true if speech recognition is currently on.
 * Returns false if speech recognition is off or annyang is paused.
 *
 * @returns true if SpeechRecognition is on and annyang is not paused
 */
const isListening = () => {
  return listening && !pauseListening;
};

export type AnnyangState = 'idle' | 'listening' | 'paused';

/**
 * Returns the current state of annyang.
 *
 * @returns {'idle' | 'listening' | 'paused'} The current state
 */
const getState = (): AnnyangState => {
  if (!listening) return 'idle';
  if (pauseListening) return 'paused';
  return 'listening';
};

/**
 * Set the language the user will speak in. If this method is not called, annyang defaults to 'en-US'.
 *
 * @param {string} language - The language (locale)
 * @see [Languages](https://github.com/TalAter/annyang/blob/master/docs/FAQ.md#what-languages-are-supported)
 */
const setLanguage = (language: string): void => {
  if (!isSpeechRecognitionSupported()) {
    return;
  }
  initIfNeeded();
  recognition.lang = language;
};

/**
 * Turn on the output of debug messages to the console.
 *
 * @param {boolean} [newState=true] - Turn debug messages on or off
 */
const debug = (newState: boolean = true): void => {
  debugState = !!newState;
};

/**
 * Match text against registered commands and fire the corresponding callbacks.
 * Works independently of the speech recognition engine — does not require `start()`, and works even in
 * environments where SpeechRecognition is not supported.
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
 * @param sentences - A sentence as a string or an array of strings of possible sentences
 */
const trigger = (sentences: string | string[] = []) => {
  parseResults(Array.isArray(sentences) ? sentences : [sentences]);
};

/**
 * Returns the instance of the browser's SpeechRecognition object used by annyang.
 * Useful in case you want direct access to the browser's Speech Recognition engine.
 *
 * @returns SpeechRecognition The browser's Speech Recognizer instance currently used by annyang
 */
const getSpeechRecognizer = (): SpeechRecognition | undefined => {
  return recognition;
};

/**
 * @deprecated annyang no longer requires manual initialization. It initializes automatically on `start()` or `addCommands()`. Remove any calls to `init()`.
 */
const initDeprecated = () => {
  console.warn(
    'annyang.init() is deprecated and no longer needed. ' +
      'annyang initializes automatically on start() or addCommands(). Remove this call.'
  );
};

export {
  abort,
  addCallback,
  addCommands,
  debug,
  getSpeechRecognizer,
  getState,
  initDeprecated as init,
  isListening,
  isSpeechRecognitionSupported,
  pause,
  removeCallback,
  removeCommands,
  resume,
  setLanguage,
  start,
  trigger,
};

const annyang = {
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
  getState,
  init: initDeprecated,
  get state() {
    return getState();
  },
} as const;

export default annyang;
