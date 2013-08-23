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
  recognition.continuous = true;
  /* @TODO: Add language support */
  recognition.lang = "en";

  recognition.onstart   = function()      { /* @TODO: Show visual cue that voice recognition is happening */ };

  recognition.onresult  = function(event) { /* @TODO: Take action */ };

  recognition.onerror   = function(event) { /* @TODO: handle errors */ };

  recognition.onend     = function()      {};

  /* @TODO: Check permission to use the mic, and alert user to permission problem */
  recognition.start();

}).call(this);
