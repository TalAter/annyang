//! Corti - Replaces the browser's SpeechRecognition with a fake object.
//! version : 0.2.1
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://github.com/TalAter/SpeechKITT/test/corti.js

(function (undefined) {
  "use strict";

  // Save a reference to the global object (window in the browser)
  var _root = this;

  // Holds the browser's implementation
  var _productionVersion = false;

  // Patch DOMException
  var DOMException = DOMException || TypeError;

  // Speech Recognition attributes
  var _maxAlternatives = 1;
  var _lang = '';
  var _continuous = false;
  var _interimResults = false;

  var newSpeechRecognition = function() {
    var _self = this;
    var _listeners = document.createElement('div');
    _self._started = false;
    _self.eventListenerTypes = ['start', 'end', 'result'];
    _self.maxAlternatives = 1;

    // Add listeners for events registered through attributes (e.g. recognition.onend = function) and not as proper listeners
    _self.eventListenerTypes.forEach(function(eventName) {
      _listeners.addEventListener(eventName, function () {
        if (typeof _self['on'+eventName] === 'function') {
          _self['on'+eventName].apply(_listeners, arguments);
        }
      }, false);
    });

    Object.defineProperty(this, 'maxAlternatives', {
      get: function() { return _maxAlternatives; },
      set: function(val) {
        if (typeof val === 'number') {
          _maxAlternatives = Math.floor(val);
        } else {
          _maxAlternatives = 0;
        }
      }
    });

    Object.defineProperty(this, 'lang', {
      get: function() { return _lang; },
      set: function(val) {
        if (val === undefined) {
          val = 'undefined';
        }
        _lang = val.toString();
      }
    });

    Object.defineProperty(this, 'continuous', {
      get: function() { return _continuous; },
      set: function(val) {
        _continuous = Boolean(val);
      }
    });

    Object.defineProperty(this, 'interimResults', {
      get: function() { return _interimResults; },
      set: function(val) {
        _interimResults = Boolean(val);
      }
    });

    this.start = function() {
      if (_self._started) {
        throw new DOMException('Failed to execute \'start\' on \'SpeechRecognition\': recognition has already started.');
      }
      _self._started = true;
      // Create and dispatch an event
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('start', false, false, null);
      _listeners.dispatchEvent(event);
    };

    this.abort = function() {
      if (!_self._started) {
        return;
      }
      _self._started = false;
      // Create and dispatch an event
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('end', false, false, null);
      _listeners.dispatchEvent(event);
    };

    this.stop = function() {
      return _self.abort();
    };

    this.isStarted = function() {
      return _self._started;
    };

    this.say = function(sentence) {
      // Create some speech alternatives
      var results = [];
      var commandIterator;
      var etcIterator;
      var itemFunction = function(index) {
        if (undefined === index) {
          throw new DOMException('Failed to execute \'item\' on \'SpeechRecognitionResult\': 1 argument required, but only 0 present.');
        }
        index = Number(index);
        if (isNaN(index)) {
          index = 0;
        }
        if (index >= this.length) {
          return null;
        } else {
          return this[index];
        }
      };
      for (commandIterator = 0; commandIterator<_maxAlternatives; commandIterator++) {
        var etc = '';
        for (etcIterator = 0; etcIterator<commandIterator; etcIterator++) {
          etc += ' and so on';
        }
        results.push(sentence+etc);
      }

      // Create the event
      var event = document.createEvent('CustomEvent');
      event.initCustomEvent('result', false, false, {'sentence': sentence});
      event.resultIndex = 0;
      event.results = {
        'item': itemFunction,
        0: {
          'item': itemFunction,
          'final': true
        }
      };
      for (commandIterator = 0; commandIterator<_maxAlternatives; commandIterator++) {
        event.results[0][commandIterator] = {
          'transcript': results[commandIterator],
          'confidence': Math.max(1-0.01*commandIterator, 0.001)
        };
      }
      Object.defineProperty(event.results, 'length', {
        get: function() { return 1; }
      });
      Object.defineProperty(event.results[0], 'length', {
        get: function() { return _maxAlternatives; }
      });
      event.interpretation = null;
      event.emma = null;
      _listeners.dispatchEvent(event);
    };

    this.addEventListener = function(event, callback) {
      _listeners.addEventListener(event, callback, false);
    };
  };

  // Expose functionality
  _root.Corti = {
    patch: function() {
      if (_productionVersion === false) {
        _productionVersion = _root.SpeechRecognition ||
          _root.webkitSpeechRecognition ||
          _root.mozSpeechRecognition ||
          _root.msSpeechRecognition ||
          _root.oSpeechRecognition;
      }
      _root.SpeechRecognition = newSpeechRecognition;
    },

    unpatch: function() {
      _root.SpeechRecognition = _productionVersion;
    }
  };

}).call(this);
