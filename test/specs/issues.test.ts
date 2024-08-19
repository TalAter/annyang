import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as annyang from '../../src/annyang';

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
