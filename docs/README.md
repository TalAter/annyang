

<!-- Start annyang.js -->

# Quick Tutorial, Intro and Demos

The quickest way to get started is to visit the [annyang homepage](https://www.talater.com/annyang/).

For a more in-depth look at annyang, read on.

# API Reference

## init(commands, [resetCommands=true])

Initialize annyang with a list of commands to recognize.

### Examples:

    var commands = {'hello :name': helloFunction};
    var commands2 = {'hi': helloFunction};

    // initialize annyang, overwriting any previously added commands
    annyang.init(commands, true);
    // adds an additional command without removing the previous commands
    annyang.init(commands2, false);

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

### Examples:
    // Start listening, don't restart automatically
    annyang.start({ autoRestart: false });
    // Start listening, don't restart automatically, stop recognition after first phrase recognized
    annyang.start({ autoRestart: false, continuous: false });

### Params: 

* **Object** *[options]* - Optional options.

## abort()

Stop listening.

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

### Examples:

    var commands = {'hello :name': helloFunction, 'howdy': helloFunction};
    var commands2 = {'hi': helloFunction};

    annyang.addCommands(commands);
    annyang.addCommands(commands2);
    // annyang will now listen to all three commands

See: [Commands Object](#commands-object)

### Params: 

* **Object** *commands* - Commands that annyang should listen to

## removeCommands([commandsToRemove])

Remove existing commands. Called with a single phrase, array of phrases, or methodically. Pass no params to remove all commands.

### Examples:

    var commands = {'hello': helloFunction, 'howdy': helloFunction, 'hi': helloFunction};

    // Remove all existing commands
    annyang.removeCommands();

    // Add some commands
    annyang.addCommands(commands);

    // Don't respond to hello
    annyang.removeCommands('hello');

    // Don't respond to howdy or hi
    annyang.removeCommands(['howdy', 'hi']);

### Params: 

* **String|Array|Undefined** *[commandsToRemove]* - Commands to remove

## addCallback(type, callback, [context])

Add a callback function to be called in case one of the following events happens:

start, error, end, result, resultMatch, resultNoMatch, errorNetwork, errorPermissionBlocked, errorPermissionDenied.

### Examples:

    annyang.addCallback('error', function () {
      $('.myErrorText').text('There was an error!');
    });

    // pass local context to a global function called notConnected
    annyang.addCallback('errorNetwork', notConnected, this);

### Params: 

* **String** *type* - Name of event that will trigger this callback
* **Function** *callback* - The function to call when event is triggered
* **Object** *[context]* - Optional context for the callback function

# Good to Know

## Commands Object

Both the [init()]() and addCommands() methods receive a `commands` object.

annyang understands commands with `named variables`, `splats`, and `optional words`.

* Use `named variables` for one word arguments in your command.
* Use `splats` to capture multi-word text at the end of your command (greedy).
* Use `optional words` or phrases to define a part of the command as optional.

### Examples:

    <script>
    var commands = {
      // annyang will capture anything after a splat (*) and pass it to the function.
      // e.g. saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
      'show me *term': showFlickr,

      // A named variable is a one word variable, that can fit anywhere in your command.
      // e.g. saying "calculate October stats" will call calculateStats('October');
      'calculate :month stats': calculateStats,

      // By defining a part of the following command as optional, annyang will respond
      // to both: "say hello to my little friend" as well as "say hello friend"
      'say hello (to my little) friend': greeting
    };

    var showFlickr = function(term) {
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

<!-- End annyang.js -->

