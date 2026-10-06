import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CortiSpeechRecognition } from 'corti';

import * as annyang from '../../src/annyang.ts';

describe('Issues', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('#193 - Speech recognition aborting while annyang is paused', () => {
    it('should not unpause annyang on restart', () => {
      annyang.start({ autoRestart: true, continuous: false });
      annyang.pause();
      annyang.getSpeechRecognizer().abort();
      expect(annyang.isListening()).toBe(false);
      vi.advanceTimersByTime(2000);
      expect(annyang.isListening()).toBe(false);
    });
  });
});

describe('Sentence punctuation', () => {
  beforeEach(() => {
    annyang.abort();
    annyang.removeCommands();
    annyang.removeCallback();
  });

  afterEach(() => {
    annyang.abort();
    annyang.removeCommands();
    annyang.removeCallback();
  });

  it.each([
    ['hello', 'Hello.'],
    ['hello', 'hello!'],
    ['hello', 'hello?'],
    ['hello', 'hello...'],
    ['hello', 'hello?!'],
    ['hello', ' hello! '],
    ['Hello, there!', 'hello there'],
    ['Hello, there!', 'Hello, there?'],
    ['hello there', 'hello, there.'],
    ['hello, there', 'hello there'],
    ['hello there friend', 'hello, there, friend!'],
    ['bonjour Élodie', 'Bonjour, Élodie!'],
    ['你好 世界', '你好, 世界.'],
    ['choose option 2 now', 'choose option 2, now.'],
    ['version 3.5', 'version 3.5.'],
    ['use C++', 'use C++!'],
    ['hello (there)', 'hello!'],
    ['hello (there)', 'hello there.'],
  ])('matches %s against %s', (phrase, transcript) => {
    const callback = vi.fn();
    annyang.addCommands({ [phrase]: callback });
    annyang.trigger(transcript);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  const values = [
    '3.5',
    '-3.5',
    'example.com',
    'example.com.',
    'C++',
    'C#',
    "O'Reilly",
    'foo-bar',
    '1,000',
    'https://example.com/a?b=1',
    'what?!',
  ];
  it.each([':value', '*value'].flatMap(parameter => values.map(value => [parameter, value])))(
    'preserves %s containing %s',
    (parameter, value) => {
      const callback = vi.fn();
      annyang.addCommands({ [`set value to ${parameter}`]: callback });
      annyang.trigger(`set value to ${value}`);
      expect(callback).toHaveBeenCalledExactlyOnceWith(value);
    }
  );

  it.each([
    ['set :value please', 'set 3.5 please!', ['3.5']],
    ['search *term please', 'search C++, example.com please?', ['C++, example.com']],
    ['search *term', 'search hello, there.', ['hello, there.']],
    ['version :major.:minor', 'version 3.5', ['3', '5']],
    ['say:word', 'say-3.5', ['-3.5']],
    ['search *term!', 'search C#!', ['C#']],
    ['search :term!', 'search C#!!', ['C#!']],
    ['say(please):word', 'say-3.5', ['-3.5']],
    ['say*word (please)', 'sayC#please', ['C#']],
    ['search *term (please)', 'search example.com.', ['example.com.']],
    ['search *term (please) ', 'search example.com.', ['example.com.']],
  ])('preserves captures for %s / %s', (phrase, transcript, values) => {
    const callback = vi.fn();
    annyang.addCommands({ [phrase]: callback });
    annyang.trigger(transcript);
    expect(callback).toHaveBeenCalledExactlyOnceWith(...values);
  });

  it.each([
    ["what's the weather", 'whats the weather'],
    ['foo-bar', 'foobar'],
    ['use C++', 'use C'],
    ['use C#', 'use C'],
    ['version 3.5', 'version 35'],
    ['pay 1,000', 'pay 1000'],
    ['hello there', 'hello,there'],
    ['hello there', 'hello; there'],
    ['hello there', 'hello,, there'],
    ['hello', 'h.e.l.l.o'],
    ['hello', '“hello”'],
    ['hello', 'hello…'],
    ['hello', 'hello。'],
    ['hello', 'hello,'],
    ['hello', 'hello goodbye'],
  ])('does not broadly strip punctuation from %s / %s', (phrase, transcript) => {
    const callback = vi.fn();
    annyang.addCommands({ [phrase]: callback });
    annyang.trigger(transcript);
    expect(callback).not.toHaveBeenCalled();
  });

  it('preserves custom regex semantics', () => {
    const callback = vi.fn();
    annyang.addCommands({ strict: { regexp: /^hello$/, callback } });
    annyang.trigger('hello.');
    expect(callback).not.toHaveBeenCalled();
    annyang.trigger('hello');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('keeps original recognition text in callbacks', () => {
    const callback = vi.fn();
    const result = vi.fn();
    const match = vi.fn();
    annyang.addCommands({ 'hello there': callback });
    annyang.addCallback('result', result);
    annyang.addCallback('resultMatch', match);
    annyang.start();
    annyang.getSpeechRecognizer().maxAlternatives = 1;
    (annyang.getSpeechRecognizer() as CortiSpeechRecognition).say('Hello, there!');
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result).toHaveBeenCalledExactlyOnceWith(['Hello, there!']);
    expect(match).toHaveBeenCalledExactlyOnceWith('Hello, there!', 'hello there', ['Hello, there!']);
  });
});
