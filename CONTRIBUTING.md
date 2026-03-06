# Contributing to annyang

Thank you for taking the time to get involved with annyang!

## How Can I Contribute?

### Contributing Code

- Fork the repository from the [annyang GitHub page](https://github.com/TalAter/annyang).
- Clone a copy to your local machine with `$ git clone git@github.com:YOUR-GITHUB-USER-NAME/annyang.git`
- Make sure you have *node.js* and *pnpm* installed on your machine.
- Install all of annyang's development dependencies with pnpm. `$ cd annyang; pnpm install`
- Run the tests to make sure everything runs smoothly: `$ pnpm test`
- Add tests for your code. [See details below](#automated-testing).
- Code, code, code. Changes should be done in `/src/annyang.ts`.
- Run `$ pnpm test` and `$ pnpm lint` after making changes to verify everything still works.

  A great alternative to repeatedly running tests is to run `$ pnpm test:watch` once and leave it running. It will continuously run all the tests every time you make a change to one of annyang's files.

- Before committing your changes, make sure `pnpm test` and `pnpm lint` both pass.
- Push your changes to a topic branch in your fork of the repository. Your branch should be based on the `master` branch.
- Visit your fork on GitHub.com and create a pull request for your changes.

#### Important:

* Make sure to run `pnpm install`, `pnpm test`, and `pnpm lint` and make sure all tasks completed successfully before committing.
* Do not change the [API docs](https://github.com/TalAter/annyang/blob/master/docs/README.md) in `/docs/README.md` directly. This file is generated automatically. Instead, update the relevant JSDoc comments in `src/annyang.ts`.
* Do not update the version number yourself.
* Please stick to the project's existing coding style.

#### Build Commands

| Command | Description |
|---|---|
| `pnpm build` | Build ESM, CJS, and IIFE bundles with tsup |
| `pnpm test` | Run tests with Vitest |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Check types with TypeScript |
| `pnpm dev` | Build in watch mode |

#### Automated Testing

annyang is tested using [Vitest](https://vitest.dev/).

Please include tests for any changes you make:
* If you found a bug, please write a test that fails because of that bug, then fix the bug so that the test passes.
* If you are adding a new feature, write tests that thoroughly test every possible use of your code.
* If you are changing existing functionality, make sure to update existing tests so they pass.

To simulate Speech Recognition in the testing environment, annyang uses a mock object called [Corti](https://github.com/TalAter/Corti) which mocks the browser's SpeechRecognition object. Corti also adds a number of utility functions to the SpeechRecognition object which simulate user actions (e.g. `say('Hello there')`).

### Reporting Bugs

Bugs are tracked as [GitHub issues](https://github.com/TalAter/annyang/issues). If you found a bug with annyang, the quickest way to get help would be to look through existing open and closed [GitHub issues](https://github.com/TalAter/annyang/issues?q=is%3Aissue). If this is a new bug, please open a [new issue](https://github.com/TalAter/annyang/issues/new).

When you are creating a bug report, please include as many details as possible. Explain the problem and include additional details to help maintainers reproduce the problem.

### Feature Requests and Ideas

We track discussions of new features, proposed changes, and other ideas as [GitHub issues](https://github.com/TalAter/annyang/issues). If you would like to discuss one of those, please first look through existing open and closed [GitHub issues](https://github.com/TalAter/annyang/issues?q=is%3Aissue) and see if there is already a discussion on this topic which you can join. If there isn't, please open a [new issue](https://github.com/TalAter/annyang/issues/new).
