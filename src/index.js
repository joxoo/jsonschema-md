const parser = require('./tasks/parser');
const tokens = require('./tasks/tokens');
const Markdown = require('./generator/markdown');
const argv = require('yargs').argv;
const errHandler = require('./common/errHandler');
const path = require('path');
const fs = require('fs');

if (argv._.length === 0) {
  errHandler('No arguments, exiting!', 'err');
}

const file = path.resolve(argv._[0]); // assign the argument as file and resolve absolute path
const outputFile = path.resolve(argv._[1]) || path.basename(file).split('.')[0]; // take the output from args or get it from base filename

try {
  const schema = parser(file, tokens);
  const generator = new Markdown(tokens);
  schema.parse((err) => {
    if (err) {
      errHandler(err, 'err');
    }
    const output = generator.generate();
    fs.writeFileSync(`${outputFile}.md`, output);
  });
} catch (e) {
  errHandler(e, 'err');
}
