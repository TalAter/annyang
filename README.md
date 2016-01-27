*annyang!*
-----------------------------------------------

A tiny javascript SpeechRecognition library that lets your users control your site with voice commands.

annyang has no dependencies, weighs just 3kb, and is free to use and modify under the MIT license.

Demo & Tutorial
---------------
[Play with some live speech recognition demos](https://www.talater.com/annyang)

Technical Documentation and API
-------------------------------
[Docs and full API reference](https://github.com/TalAter/annyang/blob/master/docs/README.md)

Hello World
-----------
It's as easy as adding [one javascript file](//cdnjs.cloudflare.com/ajax/libs/annyang/2.2.1/annyang.min.js) to your document, and defining the commands you want.
````html
<script src="//cdnjs.cloudflare.com/ajax/libs/annyang/2.2.1/annyang.min.js"></script>
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

Adding a GUI
------------
You can easily add a GUI for the user to interact with Speech Recognition using [Speech KITT](https://github.com/TalAter/SpeechKITT).

Speech KITT makes it easy to add a graphical interface for the user to start or stop Speech Recognition and see its current status. KITT also provides clear visual hints to the user on how to interact with your site using their voice, providing instructions and sample commands.

Speech KITT is fully customizable, and comes with many different themes (and instructions on how to create your own designs).

[![Speech Recognition GUI with Speech KITT](https://raw.githubusercontent.com/TalAter/SpeechKITT/master/demo/speechkitt-demo.gif)](https://github.com/TalAter/SpeechKITT)

````html
<script src="//cdnjs.cloudflare.com/ajax/libs/annyang/2.2.1/annyang.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/speechkitt.min.js"></script>
<script>
if (annyang) {
  // Add our commands to annyang
  annyang.addCommands({
    'hello': function() { alert('Hello world!'); }
  });

  // Tell KITT to use annyang
  SpeechKITT.annyang();

  // Define a stylesheet for KITT to use
  SpeechKITT.setStylesheet('//cdnjs.cloudflare.com/ajax/libs/SpeechKITT/0.3.0/themes/flat.css');

  // Render KITT's interface
  SpeechKITT.vroom();
}
</script>
````

For help with setting up a GUI with KITT, check out the [Speech KITT page](https://github.com/TalAter/SpeechKITT).


(annyang) would like to use your microphone
-------------------------------------------
![](http://i.imgur.com/Z3zooUC.png)

Chrome's implementation of SpeechRecognition behaves differently based on the protocol used:

- `https://` Asks for permission once and remembers the choice.

- `http://`  Asks for permission repeatedly **on every page load**. Results are also returned significantly slower in HTTP.

For a great user experience, don't compromise on anything less than HTTPS (available free with CloudFlare and Let's Encrypt).

Pretty Badges
-------------
[![Build Status](https://travis-ci.org/TalAter/annyang.svg?branch=master)](https://travis-ci.org/TalAter/annyang) [![Dependency Status](https://gemnasium.com/TalAter/annyang.svg)](https://gemnasium.com/TalAter/annyang)

Author
------
Tal Ater: [@TalAter](https://twitter.com/TalAter)

License
-------
Licensed under [MIT](https://github.com/TalAter/annyang/blob/master/LICENSE).
