

<!-- Start annyang.js -->

# Quick Tutorial, Intro and Demos

The quickest way to get started is to visit the [annyang homepage](https://www.talater.com/annyang/).

For a more in-depth look at annyang, read on.

# API Reference

## init(commands, [resetCommands=true])

Initialize annyang with a list of commands to recognize.

#### Examples:
````javascript
var commands = {'hello :name': helloFunction};
var commands2 = {'hi': helloFunction};

// initialize annyang, overwriting any previously added commands
annyang.init(commands, true);
// adds an additional command without removing the previous commands
annyang.init(commands2, false);
````
As of v1.1.0 it is no longer required to call init(). Just start() listening whenever you want, and addCommands() whenever, and as often as you like.

**Deprecated**

See: [Commands Object](#commands-object)

### Params:

* **Object** *commands* - Commands that annyang should listen to
* **Boolean** *[resetCommands=true]* - Remove all commands before initializing?

## start([options])

Start listening.
It's a good idea to call this after adding some commands first, but not mandatory.

Receives an optional options object which supports the following options:
- `autoRestart` (Boolean, default: true) Should annyang restart itself if it is closed indirectly, because of silence or window conflicts?
- `continuous`  (Boolean, default: undefined) Allow forcing continuous mode on or off. Annyang is pretty smart about this, so only set this if you know what you're doing.

#### Examples:
````javascript
// Start listening, don't restart automatically
annyang.start({ autoRestart: false });
// Start listening, don't restart automatically, stop recognition after first phrase recognized
annyang.start({ autoRestart: false, continuous: false });
````

### Params:

* **Object** *[options]* - Optional options.

## abort()

Stop listening, and turn off mic.

Alternatively, to only temporarily pause annyang responding to commands without stopping the SpeechRecognition engine or closing the mic, use pause() instead.

See: [pause()](#pause)

## pause()

Pause listening. annyang will stop responding to commands (until the resume or start methods are called), without turning off the browser's SpeechRecognition engine or the mic.

Alternatively, to stop the SpeechRecognition engine and close the mic, use abort() instead.

See: [abort()](#abort)

## resume()

Resumes listening and restores command callback execution when a result matches.
If SpeechRecognition was aborted (stopped), start it.

## debug([newState=true])

Turn on output of debug messages to the console. Ugly, but super-handy!

### Params:

* **Boolean** *[newState=true]* - Turn on/off debug messages

## setLanguage(language)

Set the language the user will speak in. If this method is not called, defaults to 'en-US'.

See: [Languages](#languages)

### Params:

* **String** *language* - The language (locale)

## addCommands(commands)

Add commands that annyang will respond to. Similar in syntax to init(), but doesn't remove existing commands.

#### Examples:
````javascript
var commands = {'hello :name': helloFunction, 'howdy': helloFunction};
var commands2 = {'hi': helloFunction};

annyang.addCommands(commands);
annyang.addCommands(commands2);
// annyang will now listen to all three commands
````

See: [Commands Object](#commands-object)

### Params:

* **Object** *commands* - Commands that annyang should listen to

## removeCommands([commandsToRemove])

Remove existing commands. Called with a single phrase, array of phrases, or methodically. Pass no params to remove all commands.

#### Examples:
````javascript
var commands = {'hello': helloFunction, 'howdy': helloFunction, 'hi': helloFunction};

// Remove all existing commands
annyang.removeCommands();

// Add some commands
annyang.addCommands(commands);

// Don't respond to hello
annyang.removeCommands('hello');

// Don't respond to howdy or hi
annyang.removeCommands(['howdy', 'hi']);
````

### Params:

* **String|Array|Undefined** *[commandsToRemove]* - Commands to remove

## addCallback(type, callback, [context])

Add a callback function to be called in case one of the following events happens:

* `start` - Fired as soon as the browser's Speech Recognition engine starts listening
* `error` - Fired when the browser's Speech Recogntion engine returns an error, this generic error callback will be followed by more accurate error callbacks (both will fire if both are defined)
* `errorNetwork` - Fired when Speech Recognition fails because of a network error
* `errorPermissionBlocked` - Fired when the browser blocks the permission request to use Speech Recognition.
* `errorPermissionDenied` - Fired when the user blocks the permission request to use Speech Recognition.
* `end` - Fired when the browser's Speech Recognition engine stops
* `result` - Fired as soon as some speech was identified. This generic callback will be followed by either the `resultMatch` or `resultNoMatch` callbacks.
    Callback functions registered to this event will include an array of possible phrases the user said as the first argument
* `resultMatch` - Fired when annyang was able to match between what the user said and a registered command
    Callback functions registered to this event will include three arguments in the following order:
      * The phrase the user said that matched a command
      * The command that was matched
      * An array of possible alternative phrases the user might've said
* `resultNoMatch` - Fired when what the user said didn't match any of the registered commands.
    Callback functions registered to this event will include an array of possible phrases the user might've said as the first argument

#### Examples:
````javascript
annyang.addCallback('error', function () {
  $('.myErrorText').text('There was an error!');
});

annyang.addCallback('resultMatch', function (userSaid, commandText, phrases) {
  console.log(userSaid); // sample output: 'hello'
  console.log(commandText); // sample output: 'hello (there)'
  console.log(phrases); // sample output: ['hello', 'halo', 'yellow', 'polo', 'hello kitty']
});

// pass local context to a global function called notConnected
annyang.addCallback('errorNetwork', notConnected, this);
````

### Params:

* **String** *type* - Name of event that will trigger this callback
* **Function** *callback* - The function to call when event is triggered
* **Object** *[context]* - Optional context for the callback function

## removeCallback(type, callback)

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

### Params:

* *type* Name of event type to remove callback from
* *callback* The callback function to remove

### Return:

* undefined

## isListening()

Returns true if speech recognition is currently on.
Returns false if speech recognition is off or annyang is paused.

### Return:

* boolean true = SpeechRecognition is on and annyang is listening

## getSpeechRecognizer()

Returns the instance of the browser's SpeechRecognition object used by annyang.
Useful in case you want direct access to the browser's Speech Recognition engine.

### Return:

* SpeechRecognition The browser's Speech Recognizer currently used by annyang

# Good to Know

## Commands Object

Both the [init()]() and addCommands() methods receive a `commands` object.

annyang understands commands with `named variables`, `splats`, and `optional words`.

* Use `named variables` for one word arguments in your command.
* Use `splats` to capture multi-word text at the end of your command (greedy).
* Use `optional words` or phrases to define a part of the command as optional.

#### Examples:
````html
<script>
var commands = {
  // annyang will capture anything after a splat (*) and pass it to the function.
  // e.g. saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
  'show me *tag': showFlickr,

  // A named variable is a one word variable, that can fit anywhere in your command.
  // e.g. saying "calculate October stats" will call calculateStats('October');
  'calculate :month stats': calculateStats,

  // By defining a part of the following command as optional, annyang will respond
  // to both: "say hello to my little friend" as well as "say hello friend"
  'say hello (to my little) friend': greeting
};

var showFlickr = function(tag) {
  var url = 'http://api.flickr.com/services/rest/?tags='+tag;
  $.getJSON(url);
}

var calculateStats = function(month) {
  $('#stats').text('Statistics for '+month);
}

var greeting = function() {
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
var calculateFunction = function(month) { console.log(month); }
var commands = {
  // This example will accept any word as the "month"
  'calculate :month stats': calculateFunction,
  // This example will only accept months which are at the start of a quarter
  'calculate :quarter stats': {'regexp': /^calculate (January|April|July|October) stats$/, 'callback': calculateFunction}
}
 ````

## Languages

While there isn't an official list of supported languages (cultures? locales?), here is a list based on [anecdotal evidence](http://stackoverflow.com/a/14302134/338039).

* Afrikaans `af`
* Basque `eu`
* Bulgarian `bg`
* Catalan `ca`
* Arabic (Egypt) `ar-EG`
* Arabic (Jordan) `ar-JO`
* Arabic (Kuwait) `ar-KW`
* Arabic (Lebanon) `ar-LB`
* Arabic (Qatar) `ar-QA`
* Arabic (UAE) `ar-AE`
* Arabic (Morocco) `ar-MA`
* Arabic (Iraq) `ar-IQ`
* Arabic (Algeria) `ar-DZ`
* Arabic (Bahrain) `ar-BH`
* Arabic (Lybia) `ar-LY`
* Arabic (Oman) `ar-OM`
* Arabic (Saudi Arabia) `ar-SA`
* Arabic (Tunisia) `ar-TN`
* Arabic (Yemen) `ar-YE`
* Czech `cs`
* Dutch `nl-NL`
* English (Australia) `en-AU`
* English (Canada) `en-CA`
* English (India) `en-IN`
* English (New Zealand) `en-NZ`
* English (South Africa) `en-ZA`
* English(UK) `en-GB`
* English(US) `en-US`
* Finnish `fi`
* French `fr-FR`
* Galician `gl`
* German `de-DE`
* Hebrew `he`
* Hungarian `hu`
* Icelandic `is`
* Italian `it-IT`
* Indonesian `id`
* Japanese `ja`
* Korean `ko`
* Latin `la`
* Mandarin Chinese `zh-CN`
* Traditional Taiwan `zh-TW`
* Simplified China zh-CN `?`
* Simplified Hong Kong `zh-HK`
* Yue Chinese (Traditional Hong Kong) `zh-yue`
* Malaysian `ms-MY`
* Norwegian `no-NO`
* Polish `pl`
* Pig Latin `xx-piglatin`
* Portuguese `pt-PT`
* Portuguese (Brasil) `pt-BR`
* Romanian `ro-RO`
* Russian `ru`
* Serbian `sr-SP`
* Slovak `sk`
* Spanish (Argentina) `es-AR`
* Spanish (Bolivia) `es-BO`
* Spanish (Chile) `es-CL`
* Spanish (Colombia) `es-CO`
* Spanish (Costa Rica) `es-CR`
* Spanish (Dominican Republic) `es-DO`
* Spanish (Ecuador) `es-EC`
* Spanish (El Salvador) `es-SV`
* Spanish (Guatemala) `es-GT`
* Spanish (Honduras) `es-HN`
* Spanish (Mexico) `es-MX`
* Spanish (Nicaragua) `es-NI`
* Spanish (Panama) `es-PA`
* Spanish (Paraguay) `es-PY`
* Spanish (Peru) `es-PE`
* Spanish (Puerto Rico) `es-PR`
* Spanish (Spain) `es-ES`
* Spanish (US) `es-US`
* Spanish (Uruguay) `es-UY`
* Spanish (Venezuela) `es-VE`
* Swedish `sv-SE`
* Turkish `tr`
* Zulu `zu`

## Developing

Prerequisities: node.js

First, install dependencies in your local annyang copy:

    npm install

Make sure to run the default grunt task after each change to annyang.js. This can also be done automatically by running:

    grunt watch

You can also run a local server for testing your work with:

    grunt dev

Point your browser to `https://localhost:8443/demo/` to see the demo page.
Since it's using self-signed certificate, you might need to click *"Proceed Anyway"*.

For more info, check out the [CONTRIBUTING](https://github.com/TalAter/annyang/blob/master/CONTRIBUTING.md) file

<!-- End annyang.js -->

