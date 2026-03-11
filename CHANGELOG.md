# Changelog

## 3.0.0

### New Features / Breaking Changes

- **TypeScript types included** — Full type definitions ship with the package. `addCallback` enforces correct callback signatures per event type.
- **ESM/CJS/IIFE module support** — Works with `import`, `require()`, and `<script>` tags.
- **`getState()` method** — Returns `'idle'`, `'listening'`, or `'paused'`.
- **`state` property** (on default export) — Getter that returns the current state.
- **`addCallback` returns an unsubscribe function** — Previously returned `undefined`. Now returns a function you can call to remove that specific callback:
  ```js
  const unsub = annyang.addCallback('start', myFunc);
  unsub(); // removes myFunc from 'start' callbacks
  ```
- **`trigger()` works independently of speech recognition** — `trigger()` can now be used regardless of whether annyang is listening, paused, aborted, or even in browsers that don't support speech recognition. If you need the previous behavior, check `isListening()` before calling `trigger()` or within the triggered command's callback.
- **Safe to use in unsupported browsers** — Methods like `start()`, `addCommands()`, and `setLanguage()` no longer throw when SpeechRecognition is unavailable. Speech recognition simply won't activate, but command registration and `trigger()` still work.
- **`if (annyang)` no longer detects browser support** — Starting in v3, the annyang object is always defined. Use `annyang.isSpeechRecognitionSupported()` instead:

  ```js
  // v2
  if (annyang) {
    annyang.start();
  }

  // v3
  if (annyang.isSpeechRecognitionSupported()) {
    annyang.start();
  }
  ```

- **`init()` deprecated** — annyang initializes automatically when needed. Calling `init()` now logs a deprecation warning. Remove any calls to `init()`.
- **String-based command callbacks removed** — Passing function names as strings (e.g. `{'hello': 'myFunc'}`) is no longer supported. Pass functions directly: `{'hello': myFunc}`.
- **Duplicate command phrases now overwrite** — In v2, adding a command with the same phrase would register both callbacks. In v3, the new callback replaces the old one.

### Internal

- Switched bundler from Rollup to tsup
- Migrated source to TypeScript with strict mode
- Tests migrated to Vitest
- `parseResults` refactored to use `for...of` with early return
