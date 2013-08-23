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
    return false;
  }

  var recognition = new webkitSpeechRecognition();
  recognition.maxAlternatives = 5;
  recognition.continuous = true;
  /* @TODO: Add language support */
  recognition.lang = "en";

  recognition.onstart   = function()      { /* @TODO: Show visual cue that voice recognition is happening */ };

  recognition.onresult  = function(event) {
    var results = event.results[event.resultIndex];
    var commandText = results[0].transcript.trim().toLowerCase();
    // @TODO: If not too confident about text, consider using the alternatives provided by API or ask for user intervention.
    window.console.log(commandText);
    for (var i in commandsList) {
      // @TODO: Refactor commands to regular expressions
      if (commandsList[i].command === commandText) {
        commandsList[i].callback.apply();
        return true;
      }
    }
    return false;
  };

  recognition.onerror   = function()      { /* @TODO: handle errors */ };

  recognition.onend     = function()      { /* @TODO: restart speech recognition */ };

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
