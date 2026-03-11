/**
 * Tests for environments where SpeechRecognition is NOT available.
 * This file must NOT use the Corti setup file.
 *
 * Configured via vitest workspace project "unsupported" in vitest.config.js.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as annyang from '../../src/annyang.ts';
import annyangDefault from '../../src/annyang.ts';
import { isSpeechRecognitionSupported } from '../../src/annyang.ts';

describe('When SpeechRecognition is not supported', () => {
  it('globalThis.SpeechRecognition should be undefined', () => {
    expect(globalThis.SpeechRecognition).toBeUndefined();
    expect(globalThis.webkitSpeechRecognition).toBeUndefined();
  });

  it('isSpeechRecognitionSupported() should return false (named export)', () => {
    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it('isSpeechRecognitionSupported() should return false (namespace import)', () => {
    expect(annyang.isSpeechRecognitionSupported()).toBe(false);
  });

  it('isSpeechRecognitionSupported() should return false (default export)', () => {
    expect(annyangDefault.isSpeechRecognitionSupported()).toBe(false);
  });

  it('annyang object should still be defined', () => {
    expect(annyang).toBeDefined();
    expect(annyangDefault).toBeDefined();
  });

  it('annyang methods should still be accessible', () => {
    expect(annyang.addCommands).toBeInstanceOf(Function);
    expect(annyang.start).toBeInstanceOf(Function);
    expect(annyang.abort).toBeInstanceOf(Function);
    expect(annyang.pause).toBeInstanceOf(Function);
    expect(annyang.resume).toBeInstanceOf(Function);
  });

  describe('Methods should not throw', () => {
    afterEach(() => {
      annyang.abort();
      annyang.removeCommands();
      annyang.removeCallback();
    });

    it('addCommands() should not throw', () => {
      expect(() => annyang.addCommands({ 'test command': () => {} })).not.toThrow();
    });

    it('start() should not throw', () => {
      expect(() => annyang.start()).not.toThrow();
    });

    it('setLanguage() should not throw', () => {
      expect(() => annyang.setLanguage('en-US')).not.toThrow();
    });
  });

  describe('State should reflect no speech engine', () => {
    afterEach(() => {
      annyang.abort();
      annyang.removeCommands();
      annyang.removeCallback();
    });

    it('isListening() should return false after start()', () => {
      annyang.start();
      expect(annyang.isListening()).toBe(false);
    });

    it('state should be idle after start()', () => {
      annyang.start();
      expect(annyangDefault.state).toBe('idle');
    });
  });

  describe('trigger() should work without speech recognition', () => {
    afterEach(() => {
      annyang.abort();
      annyang.removeCommands();
      annyang.removeCallback();
    });

    it('should fire a matching command callback', () => {
      const spy = vi.fn();
      annyang.addCommands({ 'test command': spy });
      annyang.trigger('test command');
      expect(spy).toHaveBeenCalled();
    });

    it('should fire the result callback', () => {
      const spy = vi.fn();
      annyang.addCallback('result', spy);
      annyang.trigger('anything');
      expect(spy).toHaveBeenCalled();
    });

    it('should fire the resultMatch callback on match', () => {
      const spy = vi.fn();
      annyang.addCommands({ 'test command': () => {} });
      annyang.addCallback('resultMatch', spy);
      annyang.trigger('test command');
      expect(spy).toHaveBeenCalled();
    });

    it('should fire the resultNoMatch callback on no match', () => {
      const spy = vi.fn();
      annyang.addCommands({ 'test command': () => {} });
      annyang.addCallback('resultNoMatch', spy);
      annyang.trigger('something else');
      expect(spy).toHaveBeenCalled();
    });
  });
});
