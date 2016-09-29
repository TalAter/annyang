(function (root, factory) {
  // jshint strict: false
  if (typeof module === 'object' && module.exports) { // CommonJS
    factory(require('../../dist/annyang.js'));
  } else if (typeof define === 'function' && define.amd) { // AMD
    define(['annyang'], factory);
  } else { // Browser globals
    factory(root.annyang);
  }
}(typeof window !== 'undefined' ? window : this, function factory(annyang) {
  "use strict";

  // Issue #193 (https://github.com/TalAter/annyang/issues/193)
  describe('Speech recognition aborting while annyang is paused', function() {

    var recognition;

    beforeEach(function() {
      recognition = annyang.getSpeechRecognizer();
      jasmine.clock().install();
      annyang.abort();
      annyang.removeCommands();
    });

    afterEach(function() {
      jasmine.clock().tick(2000);
      jasmine.clock().uninstall();
    });

    it('should not unpause annyang on restart', function() {
      annyang.start({ autoRestart: true, continuous: false });
      annyang.pause();
      recognition.abort();
      expect(annyang.isListening()).toBe(false);
      jasmine.clock().tick(1000);
      expect(annyang.isListening()).toBe(false);
    });

  });

}));
