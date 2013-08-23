// VoxCom
// version : 0.0.1
// author : Tal Ater
// license : GNU v2
// TalAter.com

(function () {
  /*global webkitSpeechRecognition */
  "use strict";

  var commandsList;
  var root = this;

  // Check browser support
  if (!('webkitSpeechRecognition' in root)) {
    //@TODO: Display friendlier message to the primitive user
    root.voxcom = null;
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

  // initiate webkitSpeechRecognition
  var recognition = new webkitSpeechRecognition();
  recognition.maxAlternatives = 5;
  recognition.continuous = true;
  /* @TODO: Add language support */
  recognition.lang = "en";

  recognition.onstart   = function()      { /* @TODO: Show visual cue that voice recognition is happening */ };

  recognition.onerror   = function()      { /* @TODO: handle errors */ };

  recognition.onend     = function()      { /* @TODO: restart speech recognition */ };

  recognition.onresult  = function(event) {
    var results = event.results[event.resultIndex];
    var commandText;
    for (var i = 0; i<results.length; i++) {
      commandText = results[i].transcript.trim();
      window.console.log('recognized: '+commandText);

      for (var j in commandsList) {
        var result = commandsList[j].command.exec(commandText);
        if (result) {
          commandsList[j].callback.apply(this, result.slice(1));
          return true;
        }
      }
    }
    // @TODO: If no command matched, consider asking for user intervention.
    return false;
  };

  root.voxcom = {
    init: function(commands) {
      commandsList = [];
      var cb,
          command;
      for (var i in commands) {
        cb = root[commands[i]] || commands[i];
        if (typeof cb !== 'function') {
          continue;
        }
        //convert command to regex
        command = commandToRegExp(i);

        //@TODO: Check if there are issues with context for the callback
        commandsList.push({ command: command, callback: cb });
      }
    },

    start: function() {
      /* @TODO: Check permission to use the mic, and alert user to permission problem */
      recognition.start();
    }
  };

}).call(this);
