*annyang!*
-----------------------------------------------

A tiny javascript library that lets your users control your site with voice commands.

annyang has no dependencies, weighs less than 1kb, and is free to use and modify under the MIT license.

Demo
----
[Visit the demo and docs site](https://www.talater.com/annyang)

Usage
-----
It's as easy as adding [one javascript file](https://github.com/TalAter/annyang/blob/master/annyang.min.js) to your document, and defining the commands you want.
````html
<script type="text/javascript" src="annyang.min.js"></script>
<script type="text/javascript">
if (annyang) {
  // Let's define a command.
  var commands = {
    'show tps report': function() { $('#tpsreport').show(); }
  };

  // Initialize annyang with our commands
  annyang.init(commands);

  // Start listening.
  annyang.start();
}
</script>
````

**For more details, [visit the demo and docs site](https://www.talater.com/annyang).**

Author
------
Tal Ater: [@TalAter](https://twitter.com/TalAter)

License
-------
Licensed under [MIT](https://github.com/TalAter/annyang/blob/master/LICENSE).
