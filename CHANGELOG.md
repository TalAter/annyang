# Changelog

## 3.0.0

### Breaking Changes

- **`init()` deprecated** — annyang initializes automatically when needed (on `start()` or `addCommands()`). Calling `init()` now logs a deprecation warning. Remove any calls to `init()`.
- **String-based command callbacks removed** — Passing function names as strings (e.g. `{'hello': 'myFunc'}`) is no longer supported. Pass functions directly: `{'hello': myFunc}`.
- **Duplicate command phrases now overwrite** — In v2, adding a command with the same phrase would register both callbacks. In v3, the new callback replaces the old one.
- **`addCallback` returns an unsubscribe function** — Previously returned `undefined`. Now returns a function you can call to remove that specific callback:
  ```js
  const unsub = annyang.addCallback('start', myFunc);
  unsub(); // removes myFunc from 'start' callbacks
  ```

### New Features

- **TypeScript types included** — Full type definitions ship with the package. `addCallback` enforces correct callback signatures per event type.
- **ESM/CJS/IIFE module support** — Works with `import`, `require()`, and `<script>` tags.
- **`getState()` method** — Returns `'idle'`, `'listening'`, or `'paused'`.
- **`state` property** (on default export) — Getter that returns the current state.

### Internal

- Switched bundler from Rollup to tsup
- Migrated source to TypeScript with strict mode
- Tests migrated to Vitest
- `parseResults` refactored to use `for...of` with early return
