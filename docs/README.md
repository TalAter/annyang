API
---
`annyang.init(commands, resetCommands)` - Initialize annyang with a list of commands to recognize. Accepts commands hash and reset commands boolean as arguments.

`annyang.addCommands(commands)` - Similiarly to annyang init, adds commands to annyang.

`annyang.removeCommands(commands)` - Remove a command, array of commands, or methodically all commands. e.g. annyang.removeCommands() will remove all commands

`annyang.start(options)` - Start listening with annyang. Accepts an options hash. e.g. annyang.start({ autoRestart: true })

`annyang.abort()` - Stop listening.

`annyang.setLanguage(language)` - Set the language the user will speak in. If not called, defaults to 'en-US'. e.g. 'fr-FR' (French-France), 'es-CR' (Español-Costa Rica)

`annyang.debug(boolean)` - Turn console debugging off/on. Useful for troubleshooting implementations!

`annyang.addCallback(eventType, callback, context)` - Allows for callbacks to be added to the following event types: start, error, end, result, resultMatch, resultNoMatch, errorNetwork, errorPermissionBlocked, errorPermissionDenied

Examples
--------
Add callbacks to events for listening and error states. Quick example with jQuery.
```javascript
  var commands = {
    'show tps report': function () { $('#tpsreport').show(); }
  };
  $(document).ready(function () {
    annyang.addCommands(commands);
    initializeCallbacks();
    $('.myStartButton').click(function () {
      annyang.start();
    });
  });
  function initializeCallbacks () {
    annyang.addCallback('start', function () {
      $('.myStateText').text('Listening...');
    });

    annyang.addCallback('end', function () {
      $('.myStateText').text('');
    });

    annyang.addCallback('error', function () {
      $('.myErrorText').text('There was an error!');
    });

    annyang.addCallback('result', function () {
      $('.myStateText').text('Got a result!');
    });

    // pass a context to a global function
    annyang.addCallback('errorNetwork', notConnected, this);
  }
  function notConnected () {
    console.error("Help, there's no internet connection!");
  }
```