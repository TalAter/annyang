

<!-- Start annyang.js -->

# Good to Know

## Commands Object

Both the [init()]() and addCommands() methods receive a `commands` object.

annyang understands commands with `named variables`, `splats`, and `optional words`.

* Use `named variables` for one word arguments in your command.
* Use `splats` to capture multi-word text at the end of your command (greedy).
* Use `optional words` or phrases to define a part of the command as optional.

### Examples:

    <script>
    var commands = {
      // annyang will capture anything after a splat (*) and pass it to the function.
      // e.g. saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
      'show me *term': showFlickr,

      // A named variable is a one word variable, that can fit anywhere in your command.
      // e.g. saying "calculate October stats" will call calculateStats('October');
      'calculate :month stats': calculateStats,

      // By defining a part of the following command as optional, annyang will respond
      // to both: "say hello to my little friend" as well as "say hello friend"
      'say hello (to my little) friend': greeting
    };

    var showFlickr = function(term) {
      var url = 'http://api.flickr.com/services/rest/?tags='+tag;
      $.getJSON(url);
    }

    var calculateStats = function(month) {
      $('#stats').text('Statistics for '+month);
    }

    var greeting = function() {
      $('#greeting').text('Hello!');
    }
    </script>

# API Reference

## init(commands, [resetCommands=true])

Initialize annyang with a list of commands to recognize.

### Examples:

    var commands = {'hello :name': helloFunction};
    var commands2 = {'hi': helloFunction};

    // initialize annyang, overwriting any previously added commands
    annyang.init(commands, true);
    // adds an additional command without removing the previous commands
    annyang.init(commands2, false);

As of v1.1.0 it is no longer required to call init(). Just start() listening whenever you want, and addCommands() whenever, and as often as you like.

**Deprecated**

See: [Commands Object](#commands-object)

### Params: 

* **Object** *commands* - Commands that annyang should listen to
* **Boolean** *[resetCommands=true]* - Remove all commands before initializing?

<!-- End annyang.js -->

