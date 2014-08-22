*annyang!*
-----------------------------------------------

A tiny javascript SpeechRecognition library that lets your users control your site with voice commands.

annyang has no dependencies, weighs just 2kb, and is free to use and modify under the MIT license.

Demo & Tutorial
---------------
[Play with some live speech recognition demos](https://www.talater.com/annyang)

Technical Documentation and API
-------------------------------
[Docs and full API reference](https://github.com/TalAter/annyang/blob/master/docs/README.md)

Hello World
-----------
It's as easy as adding [one javascript file](//cdnjs.cloudflare.com/ajax/libs/annyang/1.1.0/annyang.min.js) to your document, and defining the commands you want.
````html
<script src="//cdnjs.cloudflare.com/ajax/libs/annyang/1.1.0/annyang.min.js"></script>
<script>
if (annyang) {
  // Let's define a command.
  var commands = {
    'hello': function() { alert('Hello world!'); }
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening.
  annyang.start();
}
</script>
````
**Check out some [live speech recognition demos and advanced samples](https://www.talater.com/annyang), then read the full [API Docs](https://github.com/TalAter/annyang/blob/master/docs/README.md).**


(annyang) would like to use your microphone
-------------------------------------------
![](http://i.imgur.com/Z3zooUC.png)

Chrome's implementation of SpeechRecognition behaves differently based on the protocol used:

- `https://` Asks for permission once and remembers the choice.

- `http://`  Asks for permission repeatedly **on every page load**.

For a great user experience, don't compromise on anything less than HTTPS (an SSL certificate can be as cheap as $5).

Developing
----------
Prerequisities: node.js

First, install dependencies in your local annyang copy:

    npm install

Make sure to run the default grunt task after each change to annyang.js. This can also be done automatically by running:

    grunt watch

You can also run a local server for testing your work with:

    grunt dev

Point your browser to `https://localhost:8443/demo/` to see the demo page.
Since it's using self-signed certificate, you might need to click *"Proceed Anyway"*.

Author
------
Tal Ater: [@TalAter](https://twitter.com/TalAter)

License
-------
Licensed under [MIT](https://github.com/TalAter/annyang/blob/master/LICENSE).
