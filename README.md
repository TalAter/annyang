# annyang

A tiny JavaScript Speech Recognition library that lets your users control your site with voice commands.

**annyang** has no dependencies, weighs just a few KB, and is free to use and modify under the MIT license.

## Install

```sh
npm install annyang
```

## Hello World

### ESM (recommended)

```js
import annyang from 'annyang';

if (annyang.isSpeechRecognitionSupported()) {
  annyang.addCommands({
    'hello': () => alert('Hello world!'),
    'search for *term': (term) => console.log(`Searching for ${term}`),
  });

  annyang.start();
}
```

### Named imports

```js
import { addCommands, start, isSpeechRecognitionSupported } from 'annyang';

if (isSpeechRecognitionSupported()) {
  addCommands({ 'hello': () => alert('Hello world!') });
  start();
}
```

### CommonJS

```js
const annyang = require('annyang');
```

### Script tag (IIFE)

```html
<script src="dist/index.iife.js"></script>
<script>
if (annyang.isSpeechRecognitionSupported()) {
  annyang.addCommands({
    'hello': () => alert('Hello world!'),
  });
  annyang.start();
}
</script>
```

## Demo and Tutorial

[Play with some live speech recognition demos](https://www.talater.com/annyang)

## Documentation

- [API Reference](https://github.com/TalAter/annyang/blob/master/docs/README.md)
- [FAQ](https://github.com/TalAter/annyang/blob/master/docs/FAQ.md)
- [CHANGELOG](https://github.com/TalAter/annyang/blob/master/CHANGELOG.md)

## Author

Tal Ater: [@TalAter](https://twitter.com/TalAter)

## License

Licensed under [MIT](https://github.com/TalAter/annyang/blob/master/LICENSE).
