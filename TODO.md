### To Do
- [ ] If typeof window is undefined, console log that this is supposed to be used in the browser
- [ ] Improve JSDoc for callback function with @callback (https://jsdoc.app/tags-callback)
- [ ] Update CONTRIBUTING.md
- [ ] Add sample regular expression commands to website
- [ ] See interaction with Speech KITT
- [ ] Fix dev command to not run two chokidars
- [ ] Use Docker to test in various versions
- [ ] Update package.json with the minimal node engine version needed
- [ ] Upgrade to ESLint 9
- [ ] Remove `init()` from docs
- [ ] Check what happens if setLanguage() is called before init()
- [ ] Extract command matching code into a separate file
- [ ] Refactor 'Map the results to an array' in recognition.onresult
- [ ] Check what happens if annyang is imported more than once in the same file or different files. Can it be a singleton?
- [ ] See if can remove the condition that checks if `options.paused !== undefined` in start() as !!undefined is false
- [ ] Go over skipped tests
- [ ] TypeScript
  - [ ] Consider replacing Documentation.js, perhaps with TypeDoc?
- [ ] Sign the npm package (https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/)

### Change log

- Change importing
- Check for support with `annyang.isSpeechRecognitionSupported()`
- Deprecate `annyang.init()`. This was deprecated in v1.1.0 and removed in v3.0.0
- annyang.addCommands() now supports a second parameter to remove all existing commands first
- Deprecated undocumented behavior where a commands object could contain a string instead of a function as the action
- Fix: `autoRestart` is now true by default, even after an annyang.abort() call. Previously if you launched annyang without defining `autoRestart`, it would default to true, you you then aborted annyang and called annyang.start() again, `autoRestart` would remain false.
- Registering a command with an existing command phrase will now overwrite the previous command
