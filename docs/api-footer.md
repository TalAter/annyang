
# Good to Know

## Commands Object

annyang understands commands with `named variables`, `splats`, and `optional words`.

- Use `named variables` for one-word arguments in your command.
- Use `splats` to capture multi-word text at the end of your command (greedy).
- Use `optional words` or phrases to define a part of the command as optional.

#### Examples:
````html
<script>
const commands = {
  // annyang will capture anything after a splat (*) and pass it to the function.
  // For example saying "Show me Batman and Robin" will call showFlickr('Batman and Robin');
  'show me *tag': showFlickr,

  // A named variable is a one-word variable, that can fit anywhere in your command.
  // For example saying "calculate October stats" will call calculateStats('October');
  'calculate :month stats': calculateStats,

  // By defining a part of the following command as optional, annyang will respond
  // to both: "say hello to my little friend" as well as "say hello friend"
  'say hello (to my little) friend': greeting
};

const showFlickr = tag => {
  const url = 'http://api.flickr.com/services/rest/?tags='+tag;
  $.getJSON(url);
}

const calculateStats = month => {
  $('#stats').text('Statistics for '+month);
}

const greeting = () => {
  $('#greeting').text('Hello!');
}
</script>
````

### Using Regular Expressions in commands
For advanced commands, you can pass a regular expression object, instead of
a simple string command.

This is done by passing an object containing two properties: `regexp`, and
`callback` instead of the function.

#### Examples:
````javascript
const calculateFunction = month => { console.log(month); }
const commands = {
  // This example will accept any word as the "month"
  'calculate :month stats': calculateFunction,
  // This example will only accept months which are at the start of a quarter
  'calculate :quarter stats': {'regexp': /^calculate (January|April|July|October) stats$/, 'callback': calculateFunction}
}
````
