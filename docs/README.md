# Quick Tutorial, Intro, and Demos

The quickest way to get started is to visit the [annyang homepage](https://www.talater.com/annyang/).

For a more in-depth look at annyang, read on.

# API Reference
**annyang**

***

# annyang

## Functions

### abort()

> **abort**(): `void`

Defined in: [annyang.ts:362](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L362)

Stop listening and turn off the mic.

Alternatively, to only temporarily pause annyang responding to commands without stopping the SpeechRecognition engine or closing the mic, use pause() instead.

#### Returns

`void`

#### See

[pause()](#pause)

***

### addCallback()

> **addCallback**\<`T`\>(`type`, `callback`, `context?`): () => `void`

Defined in: [annyang.ts:452](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L452)

Add a callback function to be called in case one of the following events happens:

* `start` - Fired as soon as the browser's Speech Recognition engine starts listening.

* `soundstart` - Fired as soon as any sound (possibly speech) has been detected.

    This will fire once per Speech Recognition starting. See https://is.gd/annyang_sound_start.

* `error` - Fired when the browser's Speech Recognition engine returns an error, this generic error callback will be followed by more accurate error callbacks (both will fire if both are defined).

    The Callback function will be called with the error event as the first argument.

* `errorNetwork` - Fired when Speech Recognition fails because of a network error.

    The Callback function will be called with the error event as the first argument.

* `errorPermissionBlocked` - Fired when the browser blocks the permission request to use Speech Recognition.

    The Callback function will be called with the error event as the first argument.

* `errorPermissionDenied` - Fired when the user blocks the permission request to use Speech Recognition.

    The Callback function will be called with the error event as the first argument.

* `end` - Fired when the browser's Speech Recognition engine stops.

* `result` - Fired as soon as some speech was identified. This generic callback will be followed by either the `resultMatch` or `resultNoMatch` callbacks.

    The Callback functions for this event will be called with an array of possible phrases the user said as the first argument.

* `resultMatch` - Fired when annyang was able to match between what the user said and a registered command.

    The Callback functions for this event will be called with three arguments in the following order:

    * The phrase the user said that matched a command.
    * The command that was matched.
    * An array of possible alternative phrases the user might have said.

* `resultNoMatch` - Fired when what the user said didn't match any of the registered commands.

    Callback functions for this event will be called with an array of possible phrases the user might have said as the first argument.

#### Examples:
````javascript
annyang.addCallback('resultMatch', (userSaid, commandText, phrases) => {
  console.log(userSaid); // sample output: 'hello'
  console.log(commandText); // sample output: 'hello (there)'
  console.log(phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
});

// Returns an unsubscribe function
const unsubscribe = annyang.addCallback('error', () => {
  console.log('There was an error!');
});
unsubscribe(); // removes the callback
````

#### Type Parameters

##### T

`T` *extends* keyof `CallbackMap`

#### Parameters

##### type

`T`

Name of event that will trigger this callback

##### callback

`CallbackMap`\[`T`\]

The function to call when event is triggered

##### context?

`object` = `undefined`

Optional context for the callback function

#### Returns

A function that removes this callback when called

> (): `void`

##### Returns

`void`

***

### addCommands()

> **addCommands**(`commands`, `resetCommands?`): `void`

Defined in: [annyang.ts:254](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L254)

Add commands that annyang will respond to.
By default this will add to the existing commands. Pass `true` as the second parameter to remove all existing commands first.

#### Examples:
````javascript
const commands1 = {'hello :name': helloFunction, 'howdy': helloFunction};
const commands2 = {'hi': helloFunction};

annyang.addCommands(commands1);
annyang.addCommands(commands2);
// annyang will now listen for all three commands defined in commands1 and commands2

annyang.addCommands(commands2, true);
// annyang will now only listen for the command in commands2
````

#### Parameters

##### commands

`CommandsList`

Commands that annyang should listen for

##### resetCommands?

`boolean` = `false`

Remove all existing commands before adding new commands? *

#### Returns

`void`

#### See

[Commands Object](#commands-object)

***

### debug()

> **debug**(`newState?`): `void`

Defined in: [annyang.ts:558](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L558)

Turn on the output of debug messages to the console.

#### Parameters

##### newState?

`boolean` = `true`

Turn debug messages on or off

#### Returns

`void`

***

### getSpeechRecognizer()

> **getSpeechRecognizer**(): `SpeechRecognition`

Defined in: [annyang.ts:597](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L597)

Returns the instance of the browser's SpeechRecognition object used by annyang.
Useful in case you want direct access to the browser's Speech Recognition engine.

#### Returns

`SpeechRecognition`

SpeechRecognition The browser's Speech Recognizer instance currently used by annyang

***

### getState()

> **getState**(): `AnnyangState`

Defined in: [annyang.ts:536](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L536)

Returns the current state of annyang.

#### Returns

`AnnyangState`

The current state

***

### ~~init()~~

> **init**(): `void`

Defined in: [annyang.ts:604](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L604)

#### Returns

`void`

#### Deprecated

annyang no longer requires manual initialization. It initializes automatically on `start()` or `addCommands()`. Remove any calls to `init()`.

***

### isListening()

> **isListening**(): `boolean`

Defined in: [annyang.ts:525](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L525)

Returns true if speech recognition is currently on.
Returns false if speech recognition is off or annyang is paused.

#### Returns

`boolean`

true if SpeechRecognition is on and annyang is not paused

***

### isSpeechRecognitionSupported()

> **isSpeechRecognitionSupported**(): `boolean`

Defined in: [annyang.ts:228](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L228)

Is SpeechRecognition supported in this environment?

#### Returns

`boolean`

true if SpeechRecognition is supported by the browser

***

### pause()

> **pause**(): `void`

Defined in: [annyang.ts:377](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L377)

Pause listening. annyang will stop responding to commands (until the resume or start methods are called), without turning off the browser's SpeechRecognition engine or the mic.

Alternatively, to stop the SpeechRecognition engine and close the mic, use abort() instead.

#### Returns

`void`

#### See

[abort()](#abort)

***

### removeCallback()

> **removeCallback**(`type?`, `callback?`): `void`

Defined in: [annyang.ts:504](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L504)

Remove callbacks from events.

- Pass an event name and a callback command to remove that callback command from that event type.
- Pass just an event name to remove all callback commands from that event type.
- Pass undefined as event name and a callback command to remove that callback command from all event types.
- Pass no params to remove all callback commands from all event types.

#### Examples:
````javascript
annyang.addCallback('start', myFunction1);
annyang.addCallback('start', myFunction2);
annyang.addCallback('end', myFunction1);
annyang.addCallback('end', myFunction2);

// Remove all callbacks from all events:
annyang.removeCallback();

// Remove all callbacks attached to end event:
annyang.removeCallback('end');

// Remove myFunction2 from being called on start:
annyang.removeCallback('start', myFunction2);

// Remove myFunction1 from being called on all events:
annyang.removeCallback(undefined, myFunction1);
````

#### Parameters

##### type?

keyof CallbackMap

Name of event type to remove callback from

##### callback?

`AnyFunction`

The callback function to remove

#### Returns

`void`

undefined

***

### removeCommands()

> **removeCommands**(`commandsToRemove?`): `void`

Defined in: [annyang.ts:297](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L297)

Remove existing commands. Called with a single phrase, an array of phrases, or with no params to remove all commands.

#### Examples:
````javascript
const commands = {'hello': helloFunction, 'howdy': helloFunction, 'hi': helloFunction};

// Remove all existing commands
annyang.removeCommands();

// Add some commands
annyang.addCommands(commands);

// Don't respond to hello
annyang.removeCommands('hello');

// Don't respond to howdy or hi
annyang.removeCommands(['howdy', 'hi']);
````

#### Parameters

##### commandsToRemove?

Commands to remove

`string` | `string`[]

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Defined in: [annyang.ts:386](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L386)

Resumes listening and restore command callback execution when a command is matched.
If SpeechRecognition was aborted (stopped), start it.

#### Returns

`void`

***

### setLanguage()

> **setLanguage**(`language`): `void`

Defined in: [annyang.ts:548](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L548)

Set the language the user will speak in. If this method is not called, annyang defaults to 'en-US'.

#### Parameters

##### language

`string`

The language (locale)

#### Returns

`void`

#### See

[Languages](https://github.com/TalAter/annyang/blob/master/docs/FAQ.md#what-languages-are-supported)

***

### start()

> **start**(`options?`): `void`

Defined in: [annyang.ts:331](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L331)

Start listening.
It's a good idea to call this after adding some commands first (but not mandatory)

Receives an optional options object which supports the following options:

- `autoRestart`  (boolean) Should annyang restart itself if it is closed indirectly (e.g. because of silence or window conflicts)?
- `continuous`   (boolean) Allow forcing continuous mode on or off. annyang is pretty smart about this, so only set this if you know what you're doing.
- `paused`       (boolean) Start annyang in paused mode.

#### Examples:
````javascript
// Start listening, don't restart automatically
annyang.start({ autoRestart: false });
// Start listening, don't restart automatically, stop recognition after first phrase recognized
annyang.start({ autoRestart: false, continuous: false });
````

#### Parameters

##### options?

`StartOptions` = `{}`

Optional options.

#### Returns

`void`

***

### trigger()

> **trigger**(`sentences?`): `void`

Defined in: [annyang.ts:579](https://github.com/TalAter/annyang/blob/e9fa84191821b6ce8a1da01ddd12020f1644100f/src/annyang.ts#L579)

Simulate speech being recognized. This will trigger the same events and behavior as when the Speech Recognition
detects speech.

Can accept either a string containing a single sentence or an array containing multiple sentences to be checked
in order until one of them matches a command (similar to the way Speech Recognition Alternatives are parsed)

#### Examples:
````javascript
annyang.trigger('Time for some thrilling heroics');
annyang.trigger(
    ['Time for some thrilling heroics', 'Time for some thrilling aerobics']
  );
````

#### Parameters

##### sentences?

A sentence as a string or an array of strings of possible sentences

`string` | `string`[]

#### Returns

`void`

# Good to Know

## Commands Object

annyang understands commands with `named variables`, `splats`, and `optional words`.

- Use `named variables` for one-word arguments in your command.
- Use `splats` to capture multi-word text at the end of your command (greedy).
- Use `optional words` or phrases to define a part of the command as optional.

#### Examples:
````html
<script>
const commands = {
  // annyang will capture anything after a splat (*) and pass it to the function.
  // For example saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
  'show me *tag': showFlickr,

  // A named variable is a one-word variable, that can fit anywhere in your command.
  // For example saying "calculate October stats" will call calculateStats('October');
  'calculate :month stats': calculateStats,

  // By defining a part of the following command as optional, annyang will respond
  // to both: "say hello to my little friend" as well as "say hello friend"
  'say hello (to my little) friend': greeting
};

const showFlickr = tag => {
  const url = 'http://api.flickr.com/services/rest/?tags='+tag;
  $.getJSON(url);
}

const calculateStats = month => {
  $('#stats').text('Statistics for '+month);
}

const greeting = () => {
  $('#greeting').text('Hello!');
}
</script>
````

### Using Regular Expressions in commands
For advanced commands, you can pass a regular expression object, instead of
a simple string command.

This is done by passing an object containing two properties: `regexp`, and
`callback` instead of the function.

#### Examples:
````javascript
const calculateFunction = month => { console.log(month); }
const commands = {
  // This example will accept any word as the "month"
  'calculate :month stats': calculateFunction,
  // This example will only accept months which are at the start of a quarter
  'calculate :quarter stats': {'regexp': /^calculate (January|April|July|October) stats$/, 'callback': calculateFunction}
}
````
