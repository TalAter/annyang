/**
 * Tests for environments where SpeechRecognition is NOT available.
 * This file must NOT use the Corti setup file.
 *
 * Configured via vitest workspace project "unsupported" in vitest.config.js.
 */
import { describe, expect, it } from 'vitest';
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
});
