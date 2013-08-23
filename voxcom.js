// VoxCom
// version : 0.0.1
// author : Tal Ater
// license : GNU v2
// TalAter.com

(function () {
  /*global webkitSpeechRecognition */
  "use strict";

  // Check browser support
  if (!('webkitSpeechRecognition' in this)) {
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
    var commandText = results[0].transcript.trim();
    // @TODO: If not too confident about text, consider using the alternatives provided by API or ask for user intervention.
    window.console.log(commandText);
  };

  recognition.onerror   = function()      { /* @TODO: handle errors */ };

  recognition.onend     = function()      { /* @TODO: restart speech recognition */ };

  /* @TODO: Check permission to use the mic, and alert user to permission problem */
  recognition.start();

}).call(this);
