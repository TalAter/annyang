import annyang from 'annyang';

const log = msg => {
  document.getElementById('log').textContent += msg + '\n';
  console.log(msg);
};

annyang.addCommands({
  hello: () => log('Command matched: hello'),
});
annyang.debug(true);
annyang.start();
log('✓ annyang loaded via ESM import + bundler — say "hello"');
