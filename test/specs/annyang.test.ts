import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { SpeechRecognition as MockSpeechRecognition } from 'corti';

import * as annyang from '../../src/annyang';
import { isSpeechRecognitionSupported, start, isListening } from '../../src/annyang';

const logFormatString = 'font-weight: bold; color: #00f;';

test('SpeechRecognition is mocked', () => {
  expect(globalThis.SpeechRecognition).toBeDefined();
  expect(new globalThis.SpeechRecognition()).toBeInstanceOf(MockSpeechRecognition);
});

test('Can import annyang as an object', () => {
  expect(annyang).toBeDefined();
  expect(annyang.isSpeechRecognitionSupported).toBeInstanceOf(Function);
  expect(annyang.isSpeechRecognitionSupported()).toBe(true);
});

test('Can import individual named exports from annyang', () => {
  expect(isSpeechRecognitionSupported).toBeInstanceOf(Function);
  expect(isSpeechRecognitionSupported()).toBe(true);
  expect(isListening()).toBe(false);
  start();
  expect(isListening()).toBe(true);
});

describe('annyang', () => {
  let logSpy;

  beforeEach(() => {
    vi.useFakeTimers();
    logSpy = vi.spyOn(console, 'log');
    annyang.debug(false);
    annyang.abort();
    annyang.removeCommands();
    annyang.removeCallback();
  });

  afterEach(() => {
    vi.useRealTimers();
    logSpy.mockRestore();
  });

  it('should recognize when Speech Recognition engine was aborted and abort annyang', () => {
    annyang.start();
    expect(annyang.isListening()).toBe(true);
    annyang.getSpeechRecognizer().abort();
    expect(annyang.isListening()).toBe(false);
  });

  it('should recognize when Speech Recognition engine is repeatedly aborted as soon as it is started and console.log about it once every 10 seconds', () => {
    const recognition = annyang.getSpeechRecognizer();

    const onStart = () => {
      setTimeout(() => recognition.abort(), 1);
    };

    recognition.addEventListener('start', onStart);
    annyang.debug();
    annyang.start();
    expect(logSpy).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10000);
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(
      'Speech Recognition is repeatedly stopping and starting. See http://is.gd/annyang_restarts for tips.'
    );
    vi.advanceTimersByTime(10000);
    expect(logSpy).toHaveBeenCalledTimes(2);

    recognition.removeEventListener('start', onStart);
  });

  describe('isSpeechRecognitionSupported()', () => {
    it('should be a function', () => {
      expect(annyang.isSpeechRecognitionSupported).toBeInstanceOf(Function);
    });
    it('should return true when SpeechRecognition is available in globalThis', () => {
      expect(annyang.isSpeechRecognitionSupported()).toBe(true);
    });
  });

  describe('debug()', () => {
    it('should be a function', () => {
      expect(annyang.isSpeechRecognitionSupported).toBeInstanceOf(Function);
    });
    it('should turn on debug messages when called without a parameter', () => {
      annyang.debug();
      annyang.addCommands({ 'test command': () => {} });
      expect(logSpy).toHaveBeenCalled();
    });
    it('should turn on debug messages when called with a truthy parameter', () => {
      annyang.debug(11);
      annyang.addCommands({ 'test command': () => {} });
      expect(logSpy).toHaveBeenCalled();
    });
    it('should turn off debug messages when called with a falsy parameter', () => {
      annyang.debug(0);
      annyang.addCommands({ 'test command': () => {} });
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('addCommands()', () => {
    it('should be a function', () => {
      expect(annyang.addCommands).toBeInstanceOf(Function);
    });

    it('should accept an object consisting of key (sentence) and value (callback function)', () => {
      expect(() => {
        annyang.addCommands({
          'Time for some thrilling heroics': () => {},
        });
      }).not.toThrowError();
    });

    describe('command matching', () => {
      let spyOnMatch;

      beforeEach(() => {
        spyOnMatch = vi.fn();
      });

      it('should work when a command object with a single simple command is passed', () => {
        annyang.addCommands({ 'Time for some thrilling heroics': spyOnMatch });
        annyang.start();
        annyang.getSpeechRecognizer().say('Time for some thrilling heroics');
        expect(spyOnMatch).toHaveBeenCalledTimes(1);
      });
    });

    describe('debug messages', () => {
      it('should write to console each command that was successfully added when debug is on', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(true);

        annyang.addCommands({
          'Time for some thrilling heroics': () => {},
        });

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(
          'Command successfully loaded: %cTime for some thrilling heroics',
          logFormatString
        );

        annyang.addCommands({
          'That sounds like something out of science fiction': () => {},
          'We should start dealing in those black-market beagles': () => {},
        });

        expect(logSpy).toHaveBeenCalledTimes(3);
      });

      it('should not write to console commands added when debug is off', () => {
        annyang.debug(false);
        annyang.addCommands({
          'Time for some thrilling heroics': () => {},
        });
        annyang.addCommands({
          'That sounds like something out of science fiction': () => {},
          'We should start dealing in those black-market beagles': () => {},
        });

        expect(logSpy).not.toHaveBeenCalled();
      });

      it('should write to console when commands could not be added and debug is on', () => {
        annyang.debug(true);
        expect(logSpy).not.toHaveBeenCalled();

        annyang.addCommands({
          'Time for some thrilling heroics': 'not_a_function',
        });

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(
          'Can not register command: %cTime for some thrilling heroics',
          logFormatString
        );
      });

      it('should not write to console when commands could not be added but debug is off', () => {
        annyang.debug(false);
        annyang.addCommands({
          'Time for some thrilling heroics': 'not_a_function',
        });
        expect(logSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('removeCommands()', () => {
    let recognition;
    let spyOnMatch1;
    let spyOnMatch2;
    let spyOnMatch3;
    let spyOnMatch4;
    let spyOnMatch5;

    beforeEach(() => {
      spyOnMatch1 = vi.fn();
      spyOnMatch2 = vi.fn();
      spyOnMatch3 = vi.fn();
      spyOnMatch4 = vi.fn();
      spyOnMatch5 = vi.fn();
      annyang.addCommands({
        'Time for some (thrilling) heroics': spyOnMatch1,
        'We should start dealing in those *merchandise': spyOnMatch2,
        'That sounds like something out of science fiction': spyOnMatch3,
        'too pretty': {
          regexp: /We are just too pretty for God to let us die/,
          callback: spyOnMatch4,
        },
        "You can't take the :thing from me": spyOnMatch5,
      });
      annyang.start({ continuous: true });
      recognition = annyang.getSpeechRecognizer();
    });

    it('should be a function', () => {
      expect(annyang.removeCommands).toBeInstanceOf(Function);
    });

    it('should remove a single command when its name is passed as a string in the first parameter', () => {
      annyang.removeCommands('Time for some (thrilling) heroics');
      annyang.start();
      recognition.say('Time for some thrilling heroics');
      recognition.say('We should start dealing in those black-market beagles');
      recognition.say('That sounds like something out of science fiction');
      recognition.say('We are just too pretty for God to let us die');
      recognition.say("You can't take the sky from me");
      expect(spyOnMatch1).not.toHaveBeenCalled();
      expect(spyOnMatch2).toHaveBeenCalledTimes(1);
      expect(spyOnMatch3).toHaveBeenCalledTimes(1);
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });

    it('should remove multiple commands when their names are passed as an array in the first parameter', () => {
      annyang.removeCommands([
        'Time for some (thrilling) heroics',
        'That sounds like something out of science fiction',
      ]);
      recognition.say('Time for some thrilling heroics');
      recognition.say('We should start dealing in those black-market beagles');
      recognition.say('That sounds like something out of science fiction');
      recognition.say('We are just too pretty for God to let us die');
      recognition.say("You can't take the sky from me");

      expect(spyOnMatch1).not.toHaveBeenCalled();
      expect(spyOnMatch2).toHaveBeenCalledTimes(1);
      expect(spyOnMatch3).not.toHaveBeenCalled();
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });

    it('should remove all commands when called with no parameters', () => {
      annyang.removeCommands();
      recognition.say('Time for some heroics');
      recognition.say('We should start dealing in those black-market beagles');
      recognition.say('That sounds like something out of science fiction');
      recognition.say('We are just too pretty for God to let us die');
      recognition.say("You can't take the sky from me");

      expect(spyOnMatch1).not.toHaveBeenCalled();
      expect(spyOnMatch2).not.toHaveBeenCalled();
      expect(spyOnMatch3).not.toHaveBeenCalled();
      expect(spyOnMatch4).not.toHaveBeenCalled();
      expect(spyOnMatch5).not.toHaveBeenCalled();
    });

    it('should remove a command with an optional word when its name is passed in the first parameter', () => {
      annyang.removeCommands('Time for some (thrilling) heroics');
      recognition.say('Time for some heroics');
      recognition.say('We should start dealing in those black-market beagles');
      recognition.say('That sounds like something out of science fiction');
      recognition.say('We are just too pretty for God to let us die');
      recognition.say("You can't take the sky from me");

      expect(spyOnMatch1).not.toHaveBeenCalled();
      expect(spyOnMatch2).toHaveBeenCalledTimes(1);
      expect(spyOnMatch3).toHaveBeenCalledTimes(1);
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });

    it('should remove a command with a named variable when its name is passed in the first parameter', () => {
      annyang.removeCommands("You can't take the :thing from me");
      recognition.say('Time for some heroics');
      recognition.say('We should start dealing in those black-market beagles');
      recognition.say('That sounds like something out of science fiction');
      recognition.say('We are just too pretty for God to let us die');
      recognition.say("You can't take the sky from me");

      expect(spyOnMatch1).toHaveBeenCalledTimes(1);
      expect(spyOnMatch2).toHaveBeenCalledTimes(1);
      expect(spyOnMatch3).toHaveBeenCalledTimes(1);
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
      expect(spyOnMatch5).not.toHaveBeenCalled();
    });

    it('should remove a command with a splat when its name is passed as a parameter', () => {
      annyang.removeCommands('We should start dealing in those *merchandise');
      recognition.say('Time for some heroics');
      recognition.say('We should start dealing in those black-market beagles');
      recognition.say('That sounds like something out of science fiction');
      recognition.say('We are just too pretty for God to let us die');
      recognition.say("You can't take the sky from me");

      expect(spyOnMatch1).toHaveBeenCalledTimes(1);
      expect(spyOnMatch2).not.toHaveBeenCalled();
      expect(spyOnMatch3).toHaveBeenCalledTimes(1);
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });

    it('should remove a regexp command when its name is passed as a parameter', () => {
      annyang.removeCommands('too pretty');
      recognition.say('Time for some heroics');
      recognition.say('We should start dealing in those black-market beagles');
      recognition.say('That sounds like something out of science fiction');
      recognition.say('We are just too pretty for God to let us die');
      recognition.say("You can't take the sky from me");

      expect(spyOnMatch1).toHaveBeenCalledTimes(1);
      expect(spyOnMatch2).toHaveBeenCalledTimes(1);
      expect(spyOnMatch3).toHaveBeenCalledTimes(1);
      expect(spyOnMatch4).not.toHaveBeenCalled();
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });
  });

  describe('addCallback()', () => {
    it('should be a function', () => {
      expect(annyang.addCallback).toBeInstanceOf(Function);
    });

    it('should always return undefined', () => {
      expect(annyang.addCallback()).toEqual(undefined);
      expect(annyang.addCallback('blergh')).toEqual(undefined);
      expect(annyang.addCallback('start')).toEqual(undefined);
      expect(annyang.addCallback('start', () => {})).toEqual(undefined);
      expect(annyang.addCallback('start', () => {}, this)).toEqual(undefined);
    });

    it('should be able to register multiple callbacks to one event type', () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();

      annyang.addCallback('start', spy1);
      annyang.addCallback('start', spy2);

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();

      annyang.start();

      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
    });

    it('should run callbacks with `this` being undefined by default', () => {
      const spy1 = vi.fn();
      const fn = function () {
        spy1(this);
      };
      annyang.addCallback('start', fn);

      annyang.start();
      expect(spy1).toHaveBeenCalledWith(undefined);
    });

    it('should run callbacks in the scope where addCallback was called by default', () => {
      let counter = 0;
      const fn = function () {
        counter += 1;
      };
      annyang.addCallback('start', fn);

      annyang.start();
      expect(counter).toEqual(1);
    });

    it('should run arrow function callbacks with `this` being the current scope in which addCallback was called', () => {
      const spy1 = vi.fn();
      const fn = () => {
        spy1(this);
      };
      annyang.addCallback('start', fn);

      annyang.start();
      expect(spy1).toHaveBeenCalledWith(this);
    });

    it('should run callbacks with `this` being equal to the context given as the third parameter', () => {
      const spy1 = vi.fn();
      const obj = { counter: 0 };

      const fn = function () {
        spy1(this);
        this.counter += 1;
      };

      annyang.addCallback('start', fn, obj);
      annyang.start();

      expect(spy1).toHaveBeenCalledWith(obj);
      expect(obj.counter).toEqual(1);
    });

    it('should run arrow function callbacks with `this` being equal to the current context regardless of the context given as the third parameter', () => {
      const spy1 = vi.fn();

      const fn = () => {
        spy1(this);
      };

      annyang.addCallback('start', fn, { a: 1 });
      annyang.start();

      expect(spy1).toHaveBeenCalledWith(this);
    });
  });

  describe('removeCallback()', () => {
    let spy1;
    let spy2;
    let spy3;
    let spy4;

    beforeEach(() => {
      spy1 = vi.fn();
      spy2 = vi.fn();
      spy3 = vi.fn();
      spy4 = vi.fn();
      annyang.addCallback('start', spy1);
      annyang.addCallback('start', spy2);
      annyang.addCallback('end', spy3);
      annyang.addCallback('end', spy4);
    });

    it('should be a function', () => {
      expect(annyang.removeCallback).toBeInstanceOf(Function);
    });

    it('should always return undefined', () => {
      expect(annyang.removeCallback()).toEqual(undefined);
      expect(annyang.removeCallback('blergh')).toEqual(undefined);
      expect(annyang.removeCallback('start')).toEqual(undefined);
      expect(annyang.removeCallback('start', () => {})).toEqual(undefined);
    });

    it('should delete all callbacks on all event types if passed undefined in both parameters', () => {
      annyang.removeCallback();
      annyang.start();
      annyang.abort();

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).not.toHaveBeenCalled();
      expect(spy4).not.toHaveBeenCalled();
    });

    it('should delete all callbacks of given function on all event types if 1st parameter is undefined and second parameter is a function', () => {
      annyang.addCallback('end', spy1);
      annyang.removeCallback(undefined, spy1);
      annyang.start();
      annyang.abort();

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy3).toHaveBeenCalledTimes(1);
      expect(spy4).toHaveBeenCalledTimes(1);
    });

    it('should delete all callbacks on an event type if passed an event name and no second parameter', () => {
      annyang.removeCallback('start');
      annyang.start();
      annyang.abort();

      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).toHaveBeenCalledTimes(1);
      expect(spy4).toHaveBeenCalledTimes(1);
    });

    it('should delete the callbacks on an event type matching the function passed as the second parameter', () => {
      annyang.removeCallback('start', spy2);
      annyang.start();
      annyang.abort();

      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).toHaveBeenCalledTimes(1);
      expect(spy4).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSpeechRecognizer()', () => {
    it('should be a function', () => {
      expect(annyang.getSpeechRecognizer).toBeInstanceOf(Function);
    });

    it('should return the instance of SpeechRecognition used by annyang', () => {
      const spyOnStart = vi.fn();
      const recognition = annyang.getSpeechRecognizer();
      expect(recognition).toBeInstanceOf(MockSpeechRecognition);

      // Make sure it's the one used by annyang
      recognition.addEventListener('start', spyOnStart);
      expect(spyOnStart).not.toHaveBeenCalled();
      annyang.start();
      expect(spyOnStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('start()', () => {
    let recognition;
    let spyOnStart1;
    let spyOnStart2;

    beforeEach(() => {
      recognition = annyang.getSpeechRecognizer();
      spyOnStart1 = vi.fn();
      spyOnStart2 = vi.fn();
      recognition.addEventListener('start', spyOnStart1);
      annyang.addCallback('start', spyOnStart2);
    });

    it('should be a function', () => {
      expect(annyang.start).toBeInstanceOf(Function);
    });

    it('should start annyang and SpeechRecognition if it was aborted', () => {
      expect(spyOnStart1).not.toHaveBeenCalled();
      expect(spyOnStart2).not.toHaveBeenCalled();
      expect(annyang.isListening()).toBe(false);
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      expect(spyOnStart1).toHaveBeenCalledTimes(1);
      expect(spyOnStart2).toHaveBeenCalledTimes(1);
    });

    it('should resume annyang if it was paused', () => {
      annyang.start();
      expect(annyang.isListening()).toBe(true);

      annyang.pause();
      expect(annyang.isListening()).toBe(false);

      annyang.start();
      expect(annyang.isListening()).toBe(true);
    });

    it('should resume annyang if it was paused but not trigger start event', () => {
      expect(spyOnStart1).not.toHaveBeenCalled();
      expect(spyOnStart2).not.toHaveBeenCalled();

      annyang.start();
      expect(annyang.isListening()).toBe(true);
      expect(spyOnStart1).toHaveBeenCalledTimes(1);
      expect(spyOnStart2).toHaveBeenCalledTimes(1);

      annyang.pause();
      expect(annyang.isListening()).toBe(false);

      annyang.start();
      expect(annyang.isListening()).toBe(true);

      expect(spyOnStart1).toHaveBeenCalledTimes(1);
      expect(spyOnStart2).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when annyang is already started and listening', () => {
      annyang.start();
      expect(annyang.isListening()).toBe(true);

      expect(() => {
        annyang.start();
      }).not.toThrowError();

      expect(annyang.isListening()).toBe(true);

      expect(spyOnStart1).toHaveBeenCalledTimes(1);
      expect(spyOnStart2).toHaveBeenCalledTimes(1);
    });

    it('should accept an options object as its first argument', () => {
      expect(() => {
        annyang.start({ option: true });
      }).not.toThrowError();
    });

    describe('options', () => {
      describe('autoRestart', () => {
        it('should cause annyang to restart after 1 second when Speech Recognition engine was aborted (when true)', () => {
          annyang.start({ autoRestart: true });
          recognition.abort();
          expect(annyang.isListening()).toBe(false);
          vi.advanceTimersByTime(999);
          expect(annyang.isListening()).toBe(false);
          vi.advanceTimersByTime(1);
          expect(annyang.isListening()).toBe(true);
        });

        it('should cause annyang to not restart when Speech Recognition engine was aborted (when false)', () => {
          annyang.start({ autoRestart: false });
          recognition.abort();
          expect(annyang.isListening()).toBe(false);
          vi.advanceTimersByTime(10000);
          expect(annyang.isListening()).toBe(false);
        });

        it('should default to true, even after an annyang.abort() call', () => {
          annyang.start();
          annyang.abort();
          annyang.start();

          expect(annyang.isListening()).toBe(true);
          annyang.getSpeechRecognizer().abort();
          expect(annyang.isListening()).toBe(false);
          vi.advanceTimersByTime(20000);
          expect(annyang.isListening()).toBe(true);
        });
      });

      describe('paused', () => {
        it('should cause annyang to start paused (when true)', () => {
          annyang.start({ paused: true });
          expect(annyang.isListening()).toBe(false);
        });
        it('should cause annyang to start not paused (when false)', () => {
          annyang.start({ paused: false });
          expect(annyang.isListening()).toBe(true);
        });
      });

      describe('continuous', () => {
        let spyOnEnd;
        let spyOnResult;

        beforeEach(() => {
          spyOnEnd = vi.fn();
          spyOnResult = vi.fn();
          annyang.addCallback('end', spyOnEnd);
          annyang.addCallback('result', spyOnResult);
        });

        it('should cause annyang to continuously listen to phrases even after matches are made (when true)', () => {
          annyang.start({ continuous: true });
          expect(spyOnResult).not.toHaveBeenCalled();
          expect(spyOnEnd).not.toHaveBeenCalled();
          recognition.say('Time for some thrilling heroics');
          expect(spyOnResult).toHaveBeenCalledTimes(1);
          expect(spyOnEnd).not.toHaveBeenCalled();
          recognition.say('Time for some thrilling heroics');
          expect(spyOnResult).toHaveBeenCalledTimes(2);
          expect(spyOnEnd).not.toHaveBeenCalled();
        });

        it('should cause annyang to stop after the first recognized phrase whether it matches or not (when false)', () => {
          annyang.start({ continuous: false });
          expect(spyOnResult).not.toHaveBeenCalled();
          expect(spyOnEnd).not.toHaveBeenCalled();
          recognition.say('Time for some thrilling heroics');
          expect(spyOnResult).toHaveBeenCalledTimes(1);
          expect(spyOnEnd).toHaveBeenCalledTimes(1);
          recognition.say('Time for some thrilling heroics');
          expect(spyOnResult).toHaveBeenCalledTimes(1);
          expect(spyOnEnd).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('deubg messages', () => {
      it('should write a message to log when annyang is already started and debug is on', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(true);
        annyang.start();
        annyang.start();

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(
          "Failed to execute 'start' on 'SpeechRecognition': recognition has already started."
        );
      });

      it('should not write a message to log when annyang is already started but debug is off', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(false);
        annyang.start();
        annyang.start();

        expect(logSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('abort()', () => {
    let spyOnEnd;
    let recognition;

    beforeEach(() => {
      spyOnEnd = vi.fn();
      recognition = annyang.getSpeechRecognizer();
      recognition.addEventListener('end', spyOnEnd);
    });

    it('should be a function', () => {
      expect(annyang.abort).toBeInstanceOf(Function);
    });

    it('should stop SpeechRecognition and annyang if it is started', () => {
      annyang.start();
      expect(spyOnEnd).toHaveBeenCalledTimes(0);
      expect(annyang.isListening()).toBe(true);
      annyang.abort();
      expect(spyOnEnd).toHaveBeenCalledTimes(1);
      expect(annyang.isListening()).toBe(false);
    });

    it('should stop Speech Recognition and annyang if it is paused', () => {
      annyang.start();
      annyang.pause();
      expect(spyOnEnd).toHaveBeenCalledTimes(0);
      expect(annyang.isListening()).toBe(false);
      annyang.abort();
      expect(spyOnEnd).toHaveBeenCalledTimes(1);
      expect(annyang.isListening()).toBe(false);
    });

    it('should do nothing when annyang is already stopped', () => {
      annyang.start();
      annyang.abort();
      expect(spyOnEnd).toHaveBeenCalledTimes(1);
      annyang.abort();
      expect(spyOnEnd).toHaveBeenCalledTimes(1);
    });

    it('should not throw an error when called before annyang initializes', () => {
      expect(() => {
        annyang.abort();
      }).not.toThrowError();
    });
  });

  describe('pause()', () => {
    let recognition;

    beforeEach(() => {
      annyang.start();
      recognition = annyang.getSpeechRecognizer();
    });

    it('should be a function', () => {
      expect(annyang.pause).toBeInstanceOf(Function);
    });

    it('should return undefined when called', () => {
      expect(annyang.pause()).toEqual(undefined);
    });

    it('should cause commands not to fire even when a command phrase is matched', () => {
      const spyOnMatch = vi.fn();
      annyang.addCommands({
        'Time for some thrilling heroics': spyOnMatch,
      });
      annyang.pause();
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch).not.toHaveBeenCalled();
    });

    it("should not stop the browser's Speech Recognition engine", () => {
      expect(recognition.isStarted()).toBe(true);
      annyang.pause();
      expect(recognition.isStarted()).toBe(true);
    });

    it('should leave annyang paused if called after annyang.abort()', () => {
      expect(annyang.isListening()).toBe(true);
      annyang.abort();

      expect(annyang.isListening()).toBe(false);
      annyang.pause();

      expect(annyang.isListening()).toBe(false);
    });

    it("should leave the browser's Speech Recognition off, if called after annyang.abort()", () => {
      expect(recognition.isStarted()).toBe(true);
      annyang.abort();

      expect(recognition.isStarted()).toBe(false);
      annyang.pause();

      expect(recognition.isStarted()).toBe(false);
    });

    describe('debug messages', () => {
      beforeEach(() => {
        annyang.pause();
      });

      it('should log a message if speech detected while paused and debug is on', () => {
        annyang.debug();
        expect(logSpy).not.toHaveBeenCalled();
        recognition.say('Time for some thrilling heroics');
        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith('Speech heard, but annyang is paused');
      });

      it('should not log a message if speech detected while paused and debug is off', () => {
        annyang.debug(false);
        recognition.say('Time for some thrilling heroics');
        expect(logSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('resume()', () => {
    let recognition;

    beforeEach(() => {
      annyang.start();
      recognition = annyang.getSpeechRecognizer();
    });

    it('should be a function', () => {
      expect(annyang.resume).toBeInstanceOf(Function);
    });

    it('should return undefined when called', () => {
      expect(annyang.resume()).toEqual(undefined);
    });

    it('should leave speech recognition on and turn annyang on, if called when annyang is paused', () => {
      annyang.start();
      annyang.pause();

      expect(annyang.isListening()).toBe(false);
      expect(recognition.isStarted()).toBe(true);
      annyang.resume();

      expect(annyang.isListening()).toBe(true);
      expect(recognition.isStarted()).toBe(true);
    });

    it('should turn speech recognition and annyang on, if called when annyang is stopped', () => {
      annyang.abort();

      expect(annyang.isListening()).toBe(false);
      expect(recognition.isStarted()).toBe(false);
      annyang.resume();

      expect(annyang.isListening()).toBe(true);
      expect(recognition.isStarted()).toBe(true);
    });

    it('should leave speech recognition and annyang on, if called when annyang is listening', () => {
      expect(annyang.isListening()).toBe(true);
      expect(recognition.isStarted()).toBe(true);
      annyang.resume();

      expect(annyang.isListening()).toBe(true);
      expect(recognition.isStarted()).toBe(true);
    });

    describe('debug messages', () => {
      it('should log a message if debug is on, and resume was called when annyang is listening', () => {
        annyang.debug(true);
        annyang.resume();

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(logSpy).toHaveBeenCalledWith(
          "Failed to execute 'start' on 'SpeechRecognition': recognition has already started."
        );
      });

      it('should not log a message if debug is off, and resume was called when annyang is listening', () => {
        annyang.debug(false);
        annyang.resume();

        expect(logSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('setLanguage()', () => {
    it('should be a function', () => {
      expect(annyang.setLanguage).toBeInstanceOf(Function);
    });

    it('should return undefined when called', () => {
      expect(annyang.setLanguage()).toEqual(undefined);
    });

    it('should set the Speech Recognition engine to the value passed', () => {
      annyang.setLanguage('he');

      expect(annyang.getSpeechRecognizer().lang).toEqual('he');
    });
  });

  describe('isListening()', () => {
    it('should be a function', () => {
      expect(annyang.isListening).toBeInstanceOf(Function);
    });

    it('should return false when called before annyang starts', () => {
      expect(annyang.isListening()).toBe(false);
    });

    it('should return true when called after annyang starts', () => {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
    });

    it('should return false when called after annyang aborts', () => {
      annyang.start();
      annyang.abort();
      expect(annyang.isListening()).toBe(false);
    });

    it('should return false when called when annyang is paused', () => {
      annyang.start();
      annyang.pause();
      expect(annyang.isListening()).toBe(false);
    });

    it('should return true when called after annyang is resumed', () => {
      annyang.start();
      annyang.pause();
      annyang.resume();
      expect(annyang.isListening()).toBe(true);
    });

    it('should return false when SpeechRecognition object is aborted directly', () => {
      annyang.start();
      expect(annyang.isListening()).toBe(true);
      annyang.getSpeechRecognizer().abort();
      expect(annyang.isListening()).toBe(false);
    });
  });

  describe('trigger()', () => {
    let spyOnCommand;
    let spyOnResult;

    beforeEach(() => {
      spyOnCommand = vi.fn();
      spyOnResult = vi.fn();
      annyang.addCommands({
        'Time for some thrilling heroics': spyOnCommand,
      });
      annyang.start();
    });

    it('should always return undefined', () => {
      expect(annyang.trigger()).toEqual(undefined);
      expect(annyang.trigger('Time for some thrilling heroics')).toEqual(undefined);
      expect(annyang.trigger(['Time for some thrilling aerobics', 'Time for some thrilling heroics'])).toEqual(
        undefined
      );
    });

    it('should match a sentence passed as a string and execute it as if it was passed from Speech Recognition', () => {
      expect(spyOnCommand).not.toHaveBeenCalled();
      annyang.trigger('Time for some thrilling heroics');
      expect(spyOnCommand).toHaveBeenCalledTimes(1);
    });

    it('should match a sentence passed as part of an array and execute it as if it was passed from Speech Recognition', () => {
      expect(spyOnCommand).not.toHaveBeenCalled();
      annyang.trigger(['Time for some thrilling aerobics', 'Time for some thrilling heroics']);
      expect(spyOnCommand).toHaveBeenCalledTimes(1);
    });

    it('should trigger a result event', () => {
      annyang.addCallback('result', spyOnResult);

      expect(spyOnResult).not.toHaveBeenCalled();
      annyang.trigger('Result but not a match');

      expect(spyOnResult).toHaveBeenCalledTimes(1);
    });

    it('should trigger a resultMatch event if sentence matches a command', () => {
      annyang.addCallback('resultMatch', spyOnResult);

      expect(spyOnResult).not.toHaveBeenCalled();
      annyang.trigger('Time for some thrilling heroics');

      expect(spyOnResult).toHaveBeenCalledTimes(1);
    });

    it('should trigger a resultNoMatch event if sentence does not match a command', () => {
      annyang.addCallback('resultNoMatch', spyOnResult);

      expect(spyOnResult).not.toHaveBeenCalled();
      annyang.trigger('Result but not a match');

      expect(spyOnResult).toHaveBeenCalledTimes(1);
    });

    it('should not trigger a matching command if annyang is aborted or not started', () => {
      annyang.addCallback('resultMatch', spyOnResult);
      expect(spyOnResult).not.toHaveBeenCalled();
      annyang.abort();
      annyang.trigger('Time for some thrilling heroics');
      expect(spyOnResult).not.toHaveBeenCalled();
    });

    it('should not trigger a matching command if annyang is paused', () => {
      annyang.addCallback('resultMatch', spyOnResult);
      expect(spyOnResult).not.toHaveBeenCalled();
      annyang.pause();
      annyang.trigger('Time for some thrilling heroics');
      expect(spyOnResult).not.toHaveBeenCalled();
    });
  });

  describe('events', () => {
    describe('start', () => {
      let spyOnStart;

      beforeEach(() => {
        spyOnStart = vi.fn();
        annyang.addCallback('start', spyOnStart);
      });

      it('should fire callback when annyang aborts', () => {
        expect(spyOnStart).not.toHaveBeenCalled();
        annyang.start();
        expect(spyOnStart).toHaveBeenCalledTimes(1);
      });

      it('should not fire callback when annyang resumes from a paused state', () => {
        expect(spyOnStart).not.toHaveBeenCalled();
        annyang.start();
        expect(spyOnStart).toHaveBeenCalledTimes(1);
        annyang.pause();
        annyang.start();
        expect(spyOnStart).toHaveBeenCalledTimes(1);
      });

      it('should fire callback when annyang resumes from an aborted (stopped) state', () => {
        expect(spyOnStart).not.toHaveBeenCalled();
        annyang.start();
        expect(spyOnStart).toHaveBeenCalledTimes(1);
        annyang.abort();
        annyang.start();
        expect(spyOnStart).toHaveBeenCalledTimes(2);
      });
    });

    describe('end', () => {
      let spyOnEnd;

      beforeEach(() => {
        spyOnEnd = vi.fn();
        annyang.addCallback('end', spyOnEnd);
      });

      it('should fire callback when annyang aborts', () => {
        annyang.start();
        expect(spyOnEnd).toHaveBeenCalledTimes(0);
        annyang.abort();
        expect(spyOnEnd).toHaveBeenCalledTimes(1);
      });

      it('should not fire callback when annyang enters paused state', () => {
        annyang.start();
        annyang.pause();
        expect(spyOnEnd).toHaveBeenCalledTimes(0);
      });

      it('should trigger when SpeechRecognition is directly aborted', () => {
        annyang.start();
        annyang.getSpeechRecognizer().abort();
        expect(spyOnEnd).toHaveBeenCalledTimes(1);
      });
    });

    describe('soundstart', () => {
      let spyOnSoundStart;

      beforeEach(() => {
        spyOnSoundStart = vi.fn();
        annyang.addCallback('soundstart', spyOnSoundStart);
      });

      it('should fire callback when annyang detects sound', () => {
        expect(spyOnSoundStart).toHaveBeenCalledTimes(0);
        // Corti which is used to mock SpeechRecognition fires the soundstart event as soon as it starts
        annyang.start();
        expect(spyOnSoundStart).toHaveBeenCalledTimes(1);
      });

      it('should fire callback once when in continuous mode even when multiples phrases are said', () => {
        // Corti which is used to mock SpeechRecognition fires the soundstart event as soon as it starts
        annyang.start({ continuous: true });
        expect(spyOnSoundStart).toHaveBeenCalledTimes(1);
        annyang.getSpeechRecognizer().say('Time for some thrilling heroics');
        expect(spyOnSoundStart).toHaveBeenCalledTimes(1);
        annyang.getSpeechRecognizer().say('That sounds like something out of science fiction');
        expect(spyOnSoundStart).toHaveBeenCalledTimes(1);
      });

      it('should fire callback multiple times in non-continuous mode with autorestart', () => {
        annyang.start({ continuous: false, autoRestart: true });
        annyang.getSpeechRecognizer().say('Time for some thrilling heroics');
        expect(spyOnSoundStart).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(1000);
        annyang.getSpeechRecognizer().say('That sounds like something out of science fiction');
        expect(spyOnSoundStart).toHaveBeenCalledTimes(2);
      });
    });

    describe('result', () => {
      let spyOnResult;

      beforeEach(() => {
        spyOnResult = vi.fn();
        annyang.addCallback('result', spyOnResult);
        annyang.addCommands({
          'Time for some thrilling heroics': () => {},
        });
        annyang.start();
      });

      it('should fire callback when a result is returned from Speech Recognition and a command was matched', () => {
        expect(spyOnResult).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('Time for some thrilling heroics');
        expect(spyOnResult).toHaveBeenCalledTimes(1);
      });

      it('should fire callback when a result is returned from Speech Recognition and a command was not matched', () => {
        expect(spyOnResult).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('That sounds like something out of science fiction');
        expect(spyOnResult).toHaveBeenCalledTimes(1);
      });

      it('should call the callback with the first argument containing an array of all possible Speech Recognition Alternatives the user may have said', () => {
        expect(spyOnResult).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('That sounds like something out of science fiction');
        expect(spyOnResult).toHaveBeenCalledTimes(1);
        expect(spyOnResult).toHaveBeenCalledWith([
          'That sounds like something out of science fiction',
          'That sounds like something out of science fiction and so on',
          'That sounds like something out of science fiction and so on and so forth',
          'That sounds like something out of science fiction and so on and so forth and so on',
          'That sounds like something out of science fiction and so on and so forth and so on and so forth',
        ]);
      });
    });

    describe('resultMatch', () => {
      let spyOnResultMatch;

      beforeEach(() => {
        spyOnResultMatch = vi.fn();
        annyang.addCallback('resultMatch', spyOnResultMatch);
        annyang.addCommands({
          'Time for some (thrilling) heroics': () => {},
        });
        annyang.start();
      });

      it('should fire callback when a result is returned from Speech Recognition and a command was matched', () => {
        expect(spyOnResultMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('Time for some thrilling heroics');
        expect(spyOnResultMatch).toHaveBeenCalledTimes(1);
      });

      it('should not fire callback when a result is returned from Speech Recognition and a command was not matched', () => {
        expect(spyOnResultMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('That sounds like something out of science fiction');
        expect(spyOnResultMatch).not.toHaveBeenCalled();
      });

      it('should call the callback with the first argument containing the phrase the user said that matched a command', () => {
        expect(spyOnResultMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('Time for some heroics');
        expect(spyOnResultMatch).toHaveBeenCalledTimes(1);
        expect(spyOnResultMatch).toHaveBeenCalledWith('Time for some heroics', expect.anything(), expect.anything());
      });

      it('should call the callback with the second argument containing the name of the matched command', () => {
        expect(spyOnResultMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('Time for some heroics');
        expect(spyOnResultMatch).toHaveBeenCalledTimes(1);
        expect(spyOnResultMatch).toHaveBeenCalledWith(
          expect.anything(),
          'Time for some (thrilling) heroics',
          expect.anything()
        );
      });

      it('should call the callback with the third argument containing an array of all possible Speech Recognition Alternatives the user may have said', () => {
        expect(spyOnResultMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('Time for some heroics');
        expect(spyOnResultMatch).toHaveBeenCalledTimes(1);
        expect(spyOnResultMatch).toHaveBeenCalledWith(expect.anything(), expect.anything(), [
          'Time for some heroics',
          'Time for some heroics and so on',
          'Time for some heroics and so on and so forth',
          'Time for some heroics and so on and so forth and so on',
          'Time for some heroics and so on and so forth and so on and so forth',
        ]);
      });
    });

    describe('resultNoMatch', () => {
      let spyOnResultNoMatch;

      beforeEach(() => {
        spyOnResultNoMatch = vi.fn();
        annyang.addCallback('resultNoMatch', spyOnResultNoMatch);
        annyang.addCommands({
          'Time for some (thrilling) heroics': () => {},
        });
        annyang.start();
      });

      it('should not fire callback when a result is returned from Speech Recognition and a command was matched', () => {
        expect(spyOnResultNoMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('Time for some thrilling heroics');
        expect(spyOnResultNoMatch).not.toHaveBeenCalled();
      });

      it('should fire callback when a result is returned from Speech Recognition and a command was not matched', () => {
        expect(spyOnResultNoMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('That sounds like something out of science fiction');
        expect(spyOnResultNoMatch).toHaveBeenCalledTimes(1);
      });

      it('should call the callback with the first argument containing an array of all possible Speech Recognition Alternatives the user may have said', () => {
        expect(spyOnResultNoMatch).not.toHaveBeenCalled();
        annyang.getSpeechRecognizer().say('That sounds like something out of science fiction');
        expect(spyOnResultNoMatch).toHaveBeenCalledTimes(1);
        expect(spyOnResultNoMatch).toHaveBeenCalledWith([
          'That sounds like something out of science fiction',
          'That sounds like something out of science fiction and so on',
          'That sounds like something out of science fiction and so on and so forth',
          'That sounds like something out of science fiction and so on and so forth and so on',
          'That sounds like something out of science fiction and so on and so forth and so on and so forth',
        ]);
      });
    });

    // describe('error', () => {});
    // describe('errorNetwork', () => {});
    // describe('errorPermissionBlocked', () => {});
    // describe('errorPermissionDenied', () => {});
  });

  describe('result matching', () => {
    let spyOnMatch1;
    let spyOnMatch2;
    let spyOnMatch3;
    let spyOnMatch4;
    let spyOnMatch5;
    let recognition;

    beforeEach(() => {
      spyOnMatch1 = vi.fn();
      spyOnMatch2 = vi.fn();
      spyOnMatch3 = vi.fn();
      spyOnMatch4 = vi.fn();
      spyOnMatch5 = vi.fn();

      annyang.addCommands({
        'Time for some (thrilling) heroics': spyOnMatch1,
        'That sounds like something out of science fiction and so on and so forth': spyOnMatch2,
        "You can't take the :thing from me": spyOnMatch3,
        'We should start dealing in those *merchandise': spyOnMatch4,
      });

      annyang.start({ continuous: true });
      recognition = annyang.getSpeechRecognizer();
    });

    it('should match when phrase matches exactly', () => {
      expect(spyOnMatch1).not.toHaveBeenCalled();
      recognition.say('Time for some heroics');
      expect(spyOnMatch1).toHaveBeenCalledTimes(1);
    });

    it('should match commands with a named variable as the last word in the sentence', () => {
      annyang.removeCommands();
      annyang.addCommands({
        "You can't take the sky from :whom": spyOnMatch5,
      });
      recognition.say("You can't take the sky from me");
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });

    it('should match commands with a named variable in the middle of the sentence', () => {
      annyang.removeCommands();
      annyang.addCommands({
        "You can't take the :thing from me": spyOnMatch5,
      });
      recognition.say("You can't take the sky from me");
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });

    it('should not match commands with more than one word in the position of a named variable', () => {
      recognition.say("You can't take the sky from me");
      expect(spyOnMatch3).toHaveBeenCalledTimes(1);
      recognition.say("You can't take the stuff from me");
      expect(spyOnMatch3).toHaveBeenCalledTimes(2);
      recognition.say("You can't take the sky and stuff from me");
      expect(spyOnMatch3).toHaveBeenCalledTimes(2);
    });

    it('should not match commands with nothing in the position of a named variable', () => {
      recognition.say("You can't take the sky from me");
      expect(spyOnMatch3).toHaveBeenCalledTimes(1);
      recognition.say("You can't take the stuff from me");
      expect(spyOnMatch3).toHaveBeenCalledTimes(2);
      recognition.say("You can't take the from me");
      expect(spyOnMatch3).toHaveBeenCalledTimes(2);
    });

    it('should pass named variables to the callback function', () => {
      recognition.say("You can't take the sky from me");
      expect(spyOnMatch3).toHaveBeenLastCalledWith('sky');
      recognition.say("You can't take the stuff from me");
      expect(spyOnMatch3).toHaveBeenLastCalledWith('stuff');
    });

    it('should match commands with one or more words matched by splats', () => {
      recognition.say('We should start dealing in those beagles');
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
      recognition.say('We should start dealing in those black-market beagles');
      expect(spyOnMatch4).toHaveBeenCalledTimes(2);
    });

    it('should match commands with nothing matched by splats', () => {
      recognition.say('We should start dealing in those');
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
    });

    it('should pass what was captured by splats to the callback function', () => {
      recognition.say('We should start dealing in those black-market beagles');
      expect(spyOnMatch4).toHaveBeenCalledTimes(1);
      expect(spyOnMatch4).toHaveBeenCalledWith('black-market beagles');
    });

    it('should match commands with optional words when the word appears in the sentence', () => {
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch1).toHaveBeenCalledTimes(1);
    });

    it('should match commands with optional words when the word does not appear in the sentence', () => {
      recognition.say('Time for some heroics');
      expect(spyOnMatch1).toHaveBeenCalledTimes(1);
    });

    it('should not match commands with optional words when a different word is in the sentence', () => {
      recognition.say('Time for some gorram heroics');
      expect(spyOnMatch1).not.toHaveBeenCalled();
    });

    it('should not break when a command is removed by another command being called', () => {
      const spyMal = vi.fn(() => {
        annyang.removeCommands();
      });
      const spyWash = vi.fn(() => {
        annyang.removeCommands('Mal');
      });

      const commands = {
        Mal: spyMal,
        Wash: spyWash,
      };

      annyang.removeCommands();
      annyang.addCommands(commands);

      expect(() => {
        recognition.say('Mal');
      }).not.toThrowError();

      annyang.addCommands(commands, true);

      expect(() => {
        recognition.say('Wash');
      }).not.toThrowError();
      expect(spyMal).toHaveBeenCalledTimes(1);
      expect(spyWash).toHaveBeenCalledTimes(1);
    });

    it('should not break when a command is added by another command being called', () => {
      const spyZoe = vi.fn();

      const spyMal = vi.fn(() => {
        annyang.addCommands({ Zoe: spyZoe });
      });

      const commands = {
        Mal: spyMal,
      };

      annyang.addCommands(commands, true);

      expect(() => {
        recognition.say('Mal');
      }).not.toThrowError();

      expect(() => {
        recognition.say('Zoe');
      }).not.toThrowError();

      expect(spyMal).toHaveBeenCalledTimes(1);
      expect(spyZoe).toHaveBeenCalledTimes(1);
    });

    it('should match a commands even if the matched phrase is not the first SpeechRecognitionAlternative', () => {
      expect(spyOnMatch2).not.toHaveBeenCalled();
      // Our SpeechRecognition mock will create SpeechRecognitionAlternatives that append "and so on and so forth" to the phrase said
      recognition.say('That sounds like something out of science fiction');
      expect(spyOnMatch2).toHaveBeenCalledTimes(1);
    });

    // @TODO: Change behavior so that when adding a command with an existing command phrase, it will run both callbacks. Should also enable test `should write to console each speech recognition alternative that is recognized when a command matches`. Should also update the changelog entry about changed behavior
    it('should overwrite previously defined commands in subsequent addCommands calls if the command phrase is already registered', () => {
      annyang.addCommands({
        'Time for some (thrilling) heroics': spyOnMatch5,
      });

      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch1).not.toHaveBeenCalled();
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
    });

    it("should accept callbacks in commands object by name if they are in the globalThis scope. e.g. {'hello': 'helloFunc'}", () => {
      annyang.removeCommands();
      globalThis.globalSpyOnMatch = vi.fn();
      annyang.addCommands({
        "You can't take the sky from me": 'spyOnMatch1',
        'Time for some (thrilling) heroics': 'globalSpyOnMatch',
      });
      recognition.say("You can't take the sky from me");
      recognition.say('Time for some thrilling heroics');

      expect(spyOnMatch1).not.toHaveBeenCalled();
      expect(globalThis.globalSpyOnMatch).toHaveBeenCalledTimes(1);
    });

    it('should match commands passed as a command name and an object which consists of a regular expression and a callback', () => {
      annyang.removeCommands();
      annyang.addCommands({
        'It is time': {
          regexp: /\w* for some thrilling.*/,
          callback: spyOnMatch5,
        },
      });

      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
      recognition.say('I feel the need for some thrilling heroics');
      expect(spyOnMatch5).toHaveBeenCalledTimes(2);
    });

    it('should pass variables from regular expression capturing groups to the callback function', () => {
      annyang.removeCommands();
      annyang.addCommands({
        'It is time': {
          regexp: /Time for some (\w*) (\w*)/,
          callback: spyOnMatch5,
        },
      });
      recognition.say('Time for some thrilling heroics');
      expect(spyOnMatch5).toHaveBeenCalledTimes(1);
      expect(spyOnMatch5).toHaveBeenCalledWith('thrilling', 'heroics');
    });

    describe('debug messages', () => {
      it('should write to console when a command matches if debug is on', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(true);
        recognition.say('Time for some thrilling heroics');
        expect(logSpy).toHaveBeenCalledTimes(2);
        expect(logSpy).toHaveBeenLastCalledWith(
          'command matched: %cTime for some (thrilling) heroics',
          logFormatString
        );
      });

      it('should write to console with argument matched when command with an argument matches if debug is on', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(true);
        recognition.say("You can't take the sky from me");
        expect(logSpy).toHaveBeenCalledTimes(3); // 1 console log for speech recognized + 1 for the command matching + 1 for the parameter
        expect(logSpy).toHaveBeenLastCalledWith('with parameters', ['sky']);
      });

      it('should not write to console when a command matches if debug is off', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(false);
        recognition.say('Time for some thrilling heroics');
        expect(logSpy).not.toHaveBeenCalled();
      });

      it.skip('should write to console each speech recognition alternative that is recognized when a command matches', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(true);
        recognition.say('Time for some thrilling heroics');

        console.log(logSpy.mock.calls);

        expect(logSpy).toHaveBeenNthCalledWith(
          1,
          'Speech recognized: %cTime for some thrilling heroics',
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          2,
          'Speech recognized: %cTime for some thrilling heroics and so on',
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          3,
          'Speech recognized: %cTime for some thrilling heroics and so on and so forth',
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          4,
          'Speech recognized: %cTime for some thrilling heroics and so on and so forth and so on',
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          5,
          'Speech recognized: %cTime for some thrilling heroics and so on and so forth and so on and so forth',
          logFormatString
        );
      });

      it('should write to console each speech recognition alternative that is recognized when no command matches', () => {
        expect(logSpy).toHaveBeenCalledTimes(0);
        annyang.debug(true);
        recognition.say("Let's do some thrilling heroics");

        expect(logSpy).toHaveBeenNthCalledWith(
          1,
          "Speech recognized: %cLet's do some thrilling heroics",
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          2,
          "Speech recognized: %cLet's do some thrilling heroics and so on",
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          3,
          "Speech recognized: %cLet's do some thrilling heroics and so on and so forth",
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          4,
          "Speech recognized: %cLet's do some thrilling heroics and so on and so forth and so on",
          logFormatString
        );
        expect(logSpy).toHaveBeenNthCalledWith(
          5,
          "Speech recognized: %cLet's do some thrilling heroics and so on and so forth and so on and so forth",
          logFormatString
        );
      });
    });
  });
});
