(function() {
  "use strict";

  describe('annyang', function() {

    it('should exist in global namespace', function () {
      expect(annyang).toEqual(jasmine.any(Object));
    });

    it('should expose init method', function () {
      expect(annyang.init).toEqual(jasmine.any(Function));
    });

    it('should expose start method', function () {
      expect(annyang.start).toEqual(jasmine.any(Function));
    });

    it('should expose abort method', function () {
      expect(annyang.abort).toEqual(jasmine.any(Function));
    });

    it('should expose pause method', function () {
      expect(annyang.pause).toEqual(jasmine.any(Function));
    });

    it('should expose resume method', function () {
      expect(annyang.resume).toEqual(jasmine.any(Function));
    });

    it('should expose debug method', function () {
      expect(annyang.debug).toEqual(jasmine.any(Function));
    });

    it('should expose debug method', function () {
      expect(annyang.debug).toEqual(jasmine.any(Function));
    });

    it('should expose setLanguage method', function () {
      expect(annyang.setLanguage).toEqual(jasmine.any(Function));
    });

    it('should expose addCommands method', function () {
      expect(annyang.addCommands).toEqual(jasmine.any(Function));
    });

    it('should expose removeCommands method', function () {
      expect(annyang.removeCommands).toEqual(jasmine.any(Function));
    });

    it('should expose addCallback method', function () {
      expect(annyang.addCallback).toEqual(jasmine.any(Function));
    });

    it('should expose isListening method', function () {
      expect(annyang.isListening).toEqual(jasmine.any(Function));
    });

  });

  describe('annyang.isListening', function() {

    it('should return false when called before annyang starts', function () {
      expect(annyang.isListening()).toBe(false);
    });

    it('should return true when called after annyang starts', function () {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
    });

    it('should return false when called when annyang is paused', function () {
      annyang.abort();
      expect(annyang.isListening()).toBe(false);
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      annyang.pause();
      expect(annyang.isListening()).toBe(false);
    });

    it('should return true when called after annyang is resumed', function () {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      annyang.pause();
      expect(annyang.isListening()).toBe(false);
      annyang.resume();
      expect(annyang.isListening()).toBe(true);
    });

  });

  describe('annyang.debug', function() {

    beforeEach(function(){
      spyOn(console, 'log');
    });

    it('should be off by default', function () {
      annyang.addCommands({'test command': function() {}});
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should turn on debug messages when called without a parameter', function () {
      annyang.debug();
      annyang.addCommands({'test command': function() {}});
      expect(console.log).toHaveBeenCalled();
    });

    it('should turn off debug messages when called with a parameter that is false', function () {
      annyang.debug(true);
      annyang.debug(false);
      annyang.addCommands({'test command': function() {}});
      expect(console.log).not.toHaveBeenCalled();
      annyang.debug(0);
      annyang.addCommands({'test command': function() {}});
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should turn on debug messages when called with a parameter that is true', function () {
      annyang.debug(false);
      annyang.debug(1);
      annyang.addCommands({'test command': function() {}});
      expect(console.log.calls.count()).toEqual(1);
      annyang.debug(true);
      annyang.addCommands({'test command': function() {}});
      expect(console.log.calls.count()).toEqual(2);
    });

  });

  describe('annyang.addCallback', function() {

    beforeEach(function() {
      annyang.abort();
    });

    it('should always return undefined', function () {
      expect(annyang.addCallback()).toEqual(undefined);
      expect(annyang.addCallback('blergh')).toEqual(undefined);
      expect(annyang.addCallback('start', function() {})).toEqual(undefined);
      expect(annyang.addCallback('start', function() {}, this)).toEqual(undefined);
    });

    it('should be able to register multiple callbacks to one event', function () {
      var spyOnStart = jasmine.createSpy();
      var spyOnStart2 = jasmine.createSpy();
      annyang.addCallback('start', spyOnStart);
      annyang.addCallback('start', spyOnStart2);
      expect(spyOnStart).not.toHaveBeenCalled();
      expect(spyOnStart2).not.toHaveBeenCalled();
      annyang.start();
      expect(spyOnStart.calls.count()).toEqual(1);
      expect(spyOnStart2.calls.count()).toEqual(1);
    });

    it('should run callback in the context of annyang by default', function () {
      annyang.variableChanged = false;
      var changeVariable = function() {
        annyang.variableChanged = true;
      };
      annyang.addCallback('start', changeVariable);
      annyang.start();
      expect(annyang.variableChanged).toEqual(true);
      annyang.abort();
    });

    it('should run callbacks in the context given as the third parameter', function () {
      // First test it in this context
      this.variableChanged = false;
      var changeVariable = function() {
        this.variableChanged = true;
      };
      annyang.addCallback('start', changeVariable, this);
      annyang.start();
      expect(this.variableChanged).toEqual(true);
    });

  });

  describe("annyang.addCallback('start')", function() {

    beforeEach(function() {
      annyang.abort();
    });

    it('should add a callback which will be called when annyang starts', function () {
      var spyOnStart = jasmine.createSpy();
      annyang.addCallback('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.start();
      expect(spyOnStart.calls.count()).toEqual(1);
    });

    it('should not fire callback when annyang resumes from a paused state', function () {
      // Turn off debugging during this test, as it logs a message when resuming from a paused state which we are not testing for here
      annyang.debug(false);
      var spyOnStart = jasmine.createSpy();
      annyang.start();
      annyang.pause();
      annyang.addCallback('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.resume();
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.debug(true);
    });

    it('should fire callback when annyang resumes from an aborted (stopped) state', function () {
      var spyOnStart = jasmine.createSpy();
      annyang.start();
      annyang.abort();
      annyang.addCallback('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.resume();
      expect(spyOnStart.calls.count()).toEqual(1);
    });

  });

  describe("annyang.addCallback('end')", function() {

    beforeEach(function() {
      annyang.debug(false);
      annyang.start();
      annyang.debug(true);
    });

    it('should add a callback which will be called when annyang aborts', function () {
      var spyOnAbort = jasmine.createSpy();
      annyang.addCallback('end', spyOnAbort);
      expect(spyOnAbort).not.toHaveBeenCalled();
      annyang.abort();
      expect(spyOnAbort.calls.count()).toEqual(1);
    });

    it('should not fire callback when annyang enters paused state', function () {
      var spyOnPause = jasmine.createSpy();
      annyang.addCallback('end', spyOnPause);
      expect(spyOnPause).not.toHaveBeenCalled();
      annyang.pause();
      expect(spyOnPause).not.toHaveBeenCalled();
    });

  });

})();
