# annyang!

A tiny JavaScript Speech Recognition library that lets your users control your site with voice commands.

**annyang** has no dependencies, weighs just 2 KB, and is free to use and modify under the MIT license.

## Demo and Tutorial

[Play with some live speech recognition demos](https://www.talater.com/annyang)

## FAQ, Technical Documentation, and API Reference

- [annyang Frequently Asked Questions](https://github.com/TalAter/annyang/blob/master/docs/FAQ.md)
- [annyang API reference](https://github.com/TalAter/annyang/blob/master/docs/README.md)
- [annyang tutorial](https://www.talater.com/annyang)
- [CHANGELOG](https://github.com/TalAter/annyang/blob/master/CHANGELOG.md)

## Install

```sh
npm install annyang
```

## Hello World

It's as easy as installing annyang and defining the commands you want.

### ESM (recommended)

```js
import annyang from 'annyang';

if (annyang.isSpeechRecognitionSupported()) {
  // Let's define a command.
  const commands = {
    'hello': () => { alert('Hello world!'); },
    'search for *term': (term) => { console.log(`Searching for ${term}`); },
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening.
  annyang.start();
}
```

### Named imports

```js
import { addCommands, start, isSpeechRecognitionSupported } from 'annyang';

if (isSpeechRecognitionSupported()) {
  addCommands({ 'hello': () => { alert('Hello world!'); } });
  start();
}
```

### CommonJS

```js
const annyang = require('annyang');
```

### Script tag (IIFE)

````html
<script src="dist/index.iife.js"></script>
<script>
if (annyang.isSpeechRecognitionSupported()) {
  // Let's define a command.
  const commands = {
    'hello': () => { alert('Hello world!'); }
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening.
  annyang.start();
}
</script>
````

**Check out some [live speech recognition demos and advanced samples](https://www.talater.com/annyang), then read the full [API Docs](https://github.com/TalAter/annyang/blob/master/docs/README.md).**

## Adding a GUI

You can easily add a GUI for the user to interact with Speech Recognition using [Speech KITT](https://github.com/TalAter/SpeechKITT).

Speech KITT makes it easy to add a graphical interface for the user to start or stop Speech Recognition and see its current status. KITT also provides clear visual hints to the user on how to interact with your site using their voice, providing instructions and sample commands.

Speech KITT is fully customizable and comes with many different themes, and instructions on how to create your own designs.

[![Speech Recognition GUI with Speech KITT](https://raw.githubusercontent.com/TalAter/SpeechKITT/master/demo/speechkitt-demo.gif)](https://github.com/TalAter/SpeechKITT)

For help with setting up a GUI with KITT, check out the [Speech KITT page](https://github.com/TalAter/SpeechKITT).

## Author

Tal Ater: [@TalAter](https://twitter.com/TalAter)

## License

Licensed under [MIT](https://github.com/TalAter/annyang/blob/master/LICENSE).
