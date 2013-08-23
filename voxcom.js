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
      commandText = results[i].transcript.trim().toLowerCase();

      window.console.log(commandText);
      for (var j in commandsList) {
        // @TODO: Refactor commands to regular expressions
        if (commandsList[j].command === commandText) {
          commandsList[j].callback.apply();
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
      var cb;
      for (var i in commands) {
        cb = root[commands[i]] || commands[i];
        if (typeof cb !== 'function') {
          continue;
        }
        //@TODO: Check if there are issues with context for the callback
        commandsList.push({ command: i.toLowerCase(), callback: cb });
      }
    },

    start: function() {
      /* @TODO: Check permission to use the mic, and alert user to permission problem */
      recognition.start();
    }
  };

}).call(this);
