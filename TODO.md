### To Do

- [ ] Bump version from `3.0.0-dev` to `3.0.0`
- [ ] Release pipeline: build, docs, publish to npm (with provenance), update CDN
- [ ] After npm publish: PR to [cdnjs/packages](https://github.com/cdnjs/packages) to update `packages/a/annyang.json` — change `filename` to `annyang.iife.min.js`, switch `autoupdate.source` from `git` to `npm` (dist/ is no longer committed)
- [ ] CI: Add GitHub Actions (replace deleted `.travis.yml`)
- [ ] Demo page: modernize (jQuery 1.10, old GA, dated social widgets)
- [ ] Browser-only warning when SpeechRecognition is unavailable (e.g. server-side import)
- [ ] Document singleton behavior (ES modules are singletons by spec)
- [ ] Review and update FAQ.md (outdated patterns: null-check instead of `isSpeechRecognitionSupported()`, `init()` references, old CDN URLs, stale version notes, deprecated Crosswalk/Cordova section, broken image URL)
