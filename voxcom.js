// VoxCom
// version : 0.0.1
// author : Tal Ater
// license : GNU v2
// TalAter.com

(function () {
  "use strict";

  // Check browser support
  if (!('webkitSpeechRecognition' in this)) {
    //@TODO: Display friendlier message to the primitive user
    return false;
  }

}).call(this);
