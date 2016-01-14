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

})();
