const annyang = require('annyang');

const log = msg => {
  document.getElementById('log').textContent += msg + '\n';
  console.log(msg);
};

annyang.addCommands({
  hello: () => log('Command matched: hello'),
});
annyang.debug(true);
annyang.start();
log('✓ annyang loaded via CJS require + bundler — say "hello"');
